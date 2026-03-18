// Nominatim ジオコーディングのプロキシ（CORS 回避のためサーバー側で実行）

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400',
} as const;

const USER_AGENT = 'PremiumRealEstate/1.0';
const MAX_QUERIES = 2;
const NOMINATIM_DELAY_MS = 100;

function jsonResponse(body: object, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

function normalizeAddress(address: string): string {
  let s = address.trim();
  s = s.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
  return s;
}

function ensureJapan(q: string): string {
  const s = q.trim();
  if (!s) return s;
  const lower = s.toLowerCase();
  if (lower.endsWith(', japan') || lower.endsWith(', jp')) return s;
  return `${s}, Japan`;
}

/** クエリ候補を生成。東京は「区名→Tokyo」を最優先にして早く返す。最大 MAX_QUERIES 件 */
function buildGeocodeQueries(address: string): string[] {
  const normalized = normalizeAddress(address);
  const isTokyo = /Tokyo|東京/i.test(normalized);
  const quick: string[] = [];
  const rest: string[] = [];

  if (isTokyo) {
    const wardMatch = normalized.match(/([^,]+-ku)\s*,?\s*Tokyo/i);
    if (wardMatch) {
      const wardPart = wardMatch[1].trim();
      if (wardPart) quick.push(`${wardPart}, Tokyo, Japan`);
    }
    quick.push('Tokyo, Japan');
  }

  if (normalized.length > 0) {
    rest.push(ensureJapan(normalized));
    rest.push(normalized);
  }
  const withoutChomePrefix = normalized.replace(/^\s*\d+\s*-\s*chome\s*,\s*/i, '').trim();
  if (withoutChomePrefix.length > 0 && withoutChomePrefix !== normalized) rest.push(ensureJapan(withoutChomePrefix));
  const withoutPostal = normalized.replace(/\s+\d{3}\s*-\s*\d{4}\s*$/, '').trim();
  if (withoutPostal.length > 0) rest.push(ensureJapan(withoutPostal));
  const postalMatch = normalized.match(/(\d{3})\s*-\s*(\d{4})/);
  if (postalMatch) rest.push(`${postalMatch[1]}-${postalMatch[2]}, Japan`);

  const seen = new Set<string>();
  const dedup = (arr: string[]) =>
    arr.filter((q) => {
      const k = q.toLowerCase();
      if (seen.has(k) || q.length < 2) return false;
      seen.add(k);
      return true;
    });
  return [...dedup(quick), ...dedup(rest)].slice(0, MAX_QUERIES);
}

/** 1 住所で Nominatim に問い合わせ（国を日本に限定） */
async function queryNominatim(query: string): Promise<{ lat: number; lng: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1&accept-language=ja,en&countrycodes=jp`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept-Language': 'ja,en',
      },
    });
    if (!res.ok) {
      console.warn('[geocode] Nominatim status', res.status, 'for', query.slice(0, 40));
      return null;
    }
    const data = (await res.json()) as unknown;
    if (!Array.isArray(data) || data.length === 0) return null;
    let best = data[0] as { lat?: string; lon?: string; importance?: string; address?: { country_code?: string }; display_name?: string };
    let bestScore = 0;
    for (const row of data as Array<{ lat?: string; lon?: string; importance?: string; address?: { country_code?: string }; display_name?: string }>) {
      const lat = parseFloat(row.lat ?? '');
      const lng = parseFloat(row.lon ?? '');
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) continue;
      const importance = parseFloat(row.importance ?? '0');
      const isJapan =
        row.address?.country_code === 'jp' ||
        (row.display_name && (row.display_name.includes('Japan') || row.display_name.includes('日本')));
      const score = importance + (isJapan ? 0.3 : 0);
      if (score > bestScore) {
        bestScore = score;
        best = row;
      }
    }
    const lat = parseFloat(best.lat ?? '');
    const lng = parseFloat(best.lon ?? '');
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  } catch (e) {
    console.warn('[geocode] Nominatim fetch error', e);
    return null;
  }
}

/** フォールバック: Open-Meteo Geocoding（無料・APIキー不要、日本に限定） */
async function queryOpenMeteo(query: string): Promise<{ lat: number; lng: number } | null> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=ja&format=json`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as { results?: Array<{ latitude?: number; longitude?: number; country_code?: string }> };
    const results = data?.results;
    if (!Array.isArray(results) || results.length === 0) return null;
    const jp = results.find((r) => (r.country_code ?? '').toLowerCase() === 'jp') ?? results[0];
    const lat = Number(jp.latitude);
    const lng = Number(jp.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  } catch {
    return null;
  }
}

serve(async (req) => {
  const method = req.method;
  console.log('[geocode] request', { method });

  // Preflight: 200 で返す（一部環境で 204 が CORS で弾かれるため）
  if (method === 'OPTIONS') {
    console.log('[geocode] OPTIONS preflight -> 200');
    return new Response(null, {
      status: 200,
      headers: { ...CORS_HEADERS, 'Content-Length': '0' },
    });
  }
  if (method !== 'POST') {
    console.log('[geocode] method not allowed -> 405');
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }
  try {
    let body: { address?: string };
    try {
      body = (await req.json()) as { address?: string };
    } catch (e) {
      console.warn('[geocode] Invalid JSON body', e);
      return jsonResponse({ error: 'Invalid JSON' }, 400);
    }
    const address = typeof body.address === 'string' ? body.address.trim() : '';
    if (!address) {
      console.log('[geocode] empty address -> null');
      return jsonResponse({ lat: null, lng: null }, 200);
    }
    console.log('[geocode] address (first 50 chars):', address.slice(0, 50));
    const uniqueQueries = buildGeocodeQueries(address);
    console.log('[geocode] trying queries:', uniqueQueries.slice(0, 5).map((q) => q.slice(0, 50)));

    for (const q of uniqueQueries) {
      const result = await queryNominatim(q);
      if (result) {
        console.log('[geocode] found (Nominatim):', q.slice(0, 50), '->', result);
        return jsonResponse(result, 200);
      }
      await new Promise((r) => setTimeout(r, NOMINATIM_DELAY_MS));
    }

    for (const q of uniqueQueries.slice(0, 3)) {
      const result = await queryOpenMeteo(q);
      if (result) {
        console.log('[geocode] found (Open-Meteo):', q.slice(0, 50), '->', result);
        return jsonResponse(result, 200);
      }
    }

    console.log('[geocode] not found. tried Nominatim', uniqueQueries.length, '+ Open-Meteo 3');
    return jsonResponse({ lat: null, lng: null }, 200);
  } catch (e) {
    console.error('[geocode] error', e);
    return jsonResponse({ error: 'Internal error', lat: null, lng: null }, 500);
  }
});
