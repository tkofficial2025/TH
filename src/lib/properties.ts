/**
 * Supabase の properties テーブルから返る行（snake_case）
 */
export interface SupabasePropertyRow {
  id: number;
  title: string;
  address: string;
  price: number;
  beds: number;
  size: number;
  layout: string;
  image: string;
  station: string;
  walking_minutes: number;
  type: 'rent' | 'buy';
  is_featured: boolean | null;
  is_new: boolean | null;
  created_at?: string;
}

/**
 * 一覧・詳細で使う物件型（camelCase）
 */
export interface Property {
  id: number;
  title: string;
  address: string;
  price: number;
  beds: number;
  size: number;
  layout: string;
  image: string;
  station: string;
  walkingMinutes: number;
  isFeatured?: boolean;
  isNew?: boolean;
}

/** 行オブジェクトから値を取得（snake_case / camelCase 両対応） */
function get(row: Record<string, unknown>, ...keys: string[]): unknown {
  for (const k of keys) {
    const v = row[k];
    if (v !== undefined && v !== null) return v;
  }
  return undefined;
}

/** "5分" や 5 を数値に変換 */
function toNumber(v: unknown): number {
  if (typeof v === 'number' && !Number.isNaN(v)) return v;
  const s = String(v ?? '').replace(/\D/g, '');
  const n = parseInt(s, 10);
  return Number.isNaN(n) ? 0 : n;
}

/**
 * Supabase の行をフロント用の Property に変換（DB のカラム名の揺れに対応）
 */
export function mapSupabaseRowToProperty(row: SupabasePropertyRow | Record<string, unknown>): Property {
  const r = row as Record<string, unknown>;
  return {
    id: Number(get(r, 'id') ?? 0),
    title: String(get(r, 'title') ?? ''),
    address: String(get(r, 'address') ?? ''),
    price: Number(get(r, 'price') ?? 0),
    beds: Number(get(r, 'beds') ?? 0),
    size: Number(get(r, 'size') ?? 0),
    layout: String(get(r, 'layout') ?? ''),
    image: String(get(r, 'image') ?? ''),
    station: String(get(r, 'station') ?? ''),
    walkingMinutes: toNumber(get(r, 'walking_minutes', 'walkingMinutes')),
    isFeatured: Boolean(get(r, 'is_featured', 'isFeatured') ?? false),
    isNew: Boolean(get(r, 'is_new', 'isNew') ?? false),
  };
}

/**
 * カルーセル用の物件型（価格・サイズは表示用文字列）
 */
export interface FeaturedProperty {
  id: number;
  title: string;
  location: string;
  price: string;
  type: 'Rent' | 'Buy' | 'Investment';
  image: string;
  beds: number;
  baths: number;
  size: string;
}

/**
 * Supabase の行をカルーセル用の FeaturedProperty に変換（DB のカラム名の揺れに対応）
 */
export function mapSupabaseRowToFeaturedProperty(row: SupabasePropertyRow | Record<string, unknown>): FeaturedProperty {
  const r = row as Record<string, unknown>;
  const typeVal = String(get(r, 'type') ?? 'rent').toLowerCase();
  const type = typeVal === 'rent' ? 'Rent' : 'Buy';
  const price = Number(get(r, 'price') ?? 0);
  const priceStr = typeVal === 'rent' ? `¥${price.toLocaleString()}/mo` : `¥${price.toLocaleString()}`;
  return {
    id: Number(get(r, 'id') ?? 0),
    title: String(get(r, 'title') ?? ''),
    location: String(get(r, 'address') ?? ''),
    price: priceStr,
    type,
    image: String(get(r, 'image') ?? ''),
    beds: Number(get(r, 'beds') ?? 0),
    baths: 1,
    size: `${Number(get(r, 'size') ?? 0)}㎡`,
  };
}
