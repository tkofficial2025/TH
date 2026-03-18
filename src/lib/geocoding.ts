/**
 * 住所から座標（緯度・経度）を取得するジオコーディング
 * Supabase Edge Function（geocode）経由で Nominatim を呼ぶ。
 * 開発時は Vite プロキシ経由で同一オリジンにし CORS を回避する。
 */

import { supabaseUrl } from '@/lib/supabase-config';

export interface Coordinates {
  lat: number;
  lng: number;
}

/** 開発時: プロキシ経由の URL（CORS 回避）。本番: Supabase の URL をそのまま */
function getGeocodeUrl(): string | null {
  if (typeof window === 'undefined') return null;
  if (import.meta.env.DEV && window.location.origin) {
    return `${window.location.origin}/api/supabase-functions/functions/v1/geocode`;
  }
  if (supabaseUrl) {
    return `${supabaseUrl}/functions/v1/geocode`;
  }
  return null;
}

/**
 * 住所を座標に変換（Edge Function 経由で Nominatim を呼ぶ）
 * @param address 住所（例: "東京都渋谷区..."）
 * @returns 座標またはnull
 */
const GEOCODE_TIMEOUT_MS = 12_000; // 12秒でタイムアウト（ローディングで固まらないように）

export async function geocodeAddress(address: string): Promise<Coordinates | null> {
  if (!address || address.trim() === '') {
    return null;
  }
  const url = getGeocodeUrl();
  if (!url) return null;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GEOCODE_TIMEOUT_MS);
    const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string)?.trim() ?? '';
    const res = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(anonKey ? { Authorization: `Bearer ${anonKey}` } : {}),
      },
      body: JSON.stringify({ address: address.trim() }),
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      const text = await res.text();
      if (res.status === 404) {
        console.warn(
          'Geocoding 404: Edge Function "geocode" がデプロイされていません。Supabase Dashboard → Edge Functions → geocode をデプロイするか、CLI で supabase functions deploy geocode を実行してください。',
          text || ''
        );
      } else {
        console.warn('Geocoding error:', res.status, text);
      }
      return null;
    }
    const data = (await res.json()) as { lat?: number | null; lng?: number | null };
    if (data && typeof data.lat === 'number' && typeof data.lng === 'number') {
      return { lat: data.lat, lng: data.lng };
    }
    return null;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('Geocoding timeout: 住所の取得がタイムアウトしました。');
    } else {
      console.error('Geocoding error:', error);
    }
    return null;
  }
}

/**
 * 複数の住所を一括でジオコーディング（レート制限を考慮して順次実行）
 * @param addresses 住所の配列
 * @returns 座標の配列（取得できなかった場合はnull）
 */
export async function geocodeAddresses(addresses: string[]): Promise<(Coordinates | null)[]> {
  const results: (Coordinates | null)[] = [];
  
  for (const address of addresses) {
    const coords = await geocodeAddress(address);
    results.push(coords);
    
    // レート制限を考慮して1秒待機
    if (addresses.length > 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}
