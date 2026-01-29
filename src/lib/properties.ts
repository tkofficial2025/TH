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

/**
 * Supabase の行をフロント用の Property に変換
 */
export function mapSupabaseRowToProperty(row: SupabasePropertyRow): Property {
  return {
    id: row.id,
    title: row.title,
    address: row.address,
    price: Number(row.price),
    beds: Number(row.beds),
    size: Number(row.size),
    layout: row.layout,
    image: row.image ?? '',
    station: row.station,
    walkingMinutes: Number(row.walking_minutes),
    isFeatured: row.is_featured ?? false,
    isNew: row.is_new ?? false,
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
 * Supabase の行をカルーセル用の FeaturedProperty に変換
 */
export function mapSupabaseRowToFeaturedProperty(row: SupabasePropertyRow): FeaturedProperty {
  const type = row.type === 'rent' ? 'Rent' : 'Buy';
  const priceStr =
    row.type === 'rent'
      ? `¥${Number(row.price).toLocaleString()}/mo`
      : `¥${Number(row.price).toLocaleString()}`;
  return {
    id: row.id,
    title: row.title,
    location: row.address,
    price: priceStr,
    type,
    image: row.image ?? '',
    beds: Number(row.beds),
    baths: 1,
    size: `${Number(row.size)}㎡`,
  };
}
