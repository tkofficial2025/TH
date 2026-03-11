/**
 * Edge Function translate-property を呼び出し、物件名・住所の中国語翻訳を取得する
 */
import { supabaseUrl, supabaseAnonKey } from './supabase-config';

const envUrl = (import.meta.env.VITE_SUPABASE_URL as string)?.trim();
const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string)?.trim();
const baseUrl = (envUrl || supabaseUrl || '').trim();
const anonKey = (envKey || supabaseAnonKey || '').trim();

export type PropertyTranslationItem = {
  propertyId: number;
  title: string;
  address: string;
};

export type PropertyTranslationResult = {
  title_zh: string;
  address_zh: string;
};

const cache = new Map<number, PropertyTranslationResult>();

async function callTranslateProperty(body: {
  propertyId: number;
  title: string;
  address: string;
}): Promise<PropertyTranslationResult>;
async function callTranslateProperty(body: { items: PropertyTranslationItem[] }): Promise<{ translations: PropertyTranslationResult[] }>;
async function callTranslateProperty(
  body:
    | { propertyId: number; title: string; address: string }
    | { items: PropertyTranslationItem[] }
): Promise<PropertyTranslationResult | { translations: PropertyTranslationResult[] }> {
  if (!baseUrl || !anonKey) {
    if ('items' in body) return { translations: body.items.map((i) => ({ title_zh: i.title, address_zh: i.address })) };
    return { title_zh: (body as { title: string }).title, address_zh: (body as { address: string }).address };
  }
  const url = `${baseUrl.replace(/\/$/, '')}/functions/v1/translate-property`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${anonKey}`,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    if (import.meta.env.DEV) console.warn('[translate-property]', res.status, text);
    if ('items' in body) return { translations: body.items.map((i) => ({ title_zh: i.title, address_zh: i.address })) };
    const b = body as { title: string; address: string };
    return { title_zh: b.title, address_zh: b.address };
  }
  try {
    return JSON.parse(text) as PropertyTranslationResult | { translations: PropertyTranslationResult[] };
  } catch {
    if ('items' in body) return { translations: body.items.map((i) => ({ title_zh: i.title, address_zh: i.address })) };
    const b = body as { title: string; address: string };
    return { title_zh: b.title, address_zh: b.address };
  }
}

/** 1件の物件の中国語翻訳を取得（キャッシュあり） */
export async function getPropertyTranslation(
  propertyId: number,
  title: string,
  address: string
): Promise<PropertyTranslationResult> {
  const cached = cache.get(propertyId);
  if (cached) return cached;
  const result = (await callTranslateProperty({ propertyId, title, address })) as PropertyTranslationResult;
  cache.set(propertyId, result);
  return result;
}

/** 複数物件の中国語翻訳を一括取得 */
export async function getPropertyTranslationsBatch(
  items: PropertyTranslationItem[]
): Promise<Map<number, PropertyTranslationResult>> {
  const map = new Map<number, PropertyTranslationResult>();
  const missing: PropertyTranslationItem[] = [];
  for (const item of items) {
    const cached = cache.get(item.propertyId);
    if (cached) map.set(item.propertyId, cached);
    else missing.push(item);
  }
  if (missing.length === 0) return map;
  const result = (await callTranslateProperty({ items: missing })) as { translations: PropertyTranslationResult[] };
  const list = result.translations ?? [];
  missing.forEach((item, i) => {
    const t = list[i] ?? { title_zh: item.title, address_zh: item.address };
    map.set(item.propertyId, t);
    cache.set(item.propertyId, t);
  });
  return map;
}

/** 言語が zh のとき物件リストの中国語翻訳を取得する hook 用の型 */
export interface PropertyForTranslation {
  id: number;
  title: string;
  address: string;
}

/**
 * 言語が zh のとき、物件リストの title/address の中国語翻訳を取得する。
 * 返り値の Map は id -> { title_zh, address_zh }。言語が en のときは空の Map。
 */
export async function fetchTranslationsForProperties(
  properties: PropertyForTranslation[],
  language: 'en' | 'zh'
): Promise<Map<number, PropertyTranslationResult>> {
  if (language !== 'zh' || properties.length === 0) return new Map();
  const items = properties.map((p) => ({ propertyId: p.id, title: p.title, address: p.address }));
  return getPropertyTranslationsBatch(items);
}
