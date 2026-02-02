/**
 * 区名（英語）と address 判定用キーワード（英語・日本語）
 * TokyoWardsSection と Rent/Buy ページの絞り込みで共通利用
 */
export const WARD_MATCH_TERMS: Record<string, string[]> = {
  Minato: ['minato', '港区'],
  Shibuya: ['shibuya', '渋谷'],
  Shinjuku: ['shinjuku', '新宿'],
  Meguro: ['meguro', '目黒'],
  Setagaya: ['setagaya', '世田谷'],
  Bunkyo: ['bunkyo', '文京'],
  Chuo: ['chuo', '中央区'],
  Taito: ['taito', '台東'],
  Chiyoda: ['chiyoda', '千代田'],
};

/** Supabase の address で区を絞り込むための .or() 用文字列（ilike） */
export function wardFilterOr(wardName: string): string {
  const terms = WARD_MATCH_TERMS[wardName];
  if (!terms?.length) return '';
  return terms.map((t) => `address.ilike.%${t}%`).join(',');
}

export const WARD_NAMES = Object.keys(WARD_MATCH_TERMS) as string[];
