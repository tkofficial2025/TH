import type { Property } from '@/lib/properties';

function normalizeLayout(layout: string): string {
  return layout.replace(/\s+/g, '').toUpperCase();
}

/**
 * 間取りが 1R / 1K / 1K+ / 1DK 系（1LDK・1SLDK 等は除外）
 */
export function isStudioLayout(property: Pick<Property, 'layout' | 'title'>): boolean {
  const raw = (property.layout ?? '').trim();
  if (raw) {
    const u = normalizeLayout(raw);
    if (u.startsWith('1LDK') || u.startsWith('1SLDK')) return false;
    if (/^[2-9]/.test(u)) return false;
    if (u.startsWith('1R')) return true;
    if (u.startsWith('1DK')) return true;
    if (u === '1K' || u.startsWith('1K+')) return true;
  }
  const t = (property.title ?? '').toLowerCase();
  if (t.includes('1ldk') || t.includes('1sldk')) return false;
  if (t.includes('ワンルーム') || t.includes('one room')) return true;
  if (/\b1\s*r\b/i.test(t) || /\b1r\b/i.test(t)) return true;
  if (/\b1\s*dk\b/i.test(t) || /\b1dk\b/i.test(t)) return true;
  if (/\b1\s*k\b/i.test(t) || /\b1k\b/i.test(t)) return true;
  return false;
}

/** 戸建て系（物件名） */
export function isHouseTitle(property: Pick<Property, 'title'>): boolean {
  const t = (property.title ?? '').toLowerCase();
  return (
    t.includes('house') ||
    t.includes('一戸建て') ||
    t.includes('戸建') ||
    t.includes('detached')
  );
}

/**
 * マンション・アパート統合: スタジオ間取りでも戸建てでもない一般物件
 */
export function isMansionApartment(property: Pick<Property, 'layout' | 'title'>): boolean {
  return !isStudioLayout(property) && !isHouseTitle(property);
}

/**
 * 物件タイプ絞り込み（一覧・お気に入り共通）
 * - studio: 1R / 1K / 1DK 系（layout 優先）
 * - house: 物件名に House 等
 * - mansion_apartment: アパート・マンション統合（上記以外）
 * - apartment / condominium: 後方互換で mansion_apartment と同じ
 */
export function matchesPropertyTypeFilter(property: Property, filterValue: string): boolean {
  const v = filterValue.trim().toLowerCase();
  if (!v) return true;
  switch (v) {
    case 'studio':
      return isStudioLayout(property);
    case 'house':
      return isHouseTitle(property);
    case 'mansion_apartment':
    case 'apartment':
    case 'condominium':
      return isMansionApartment(property);
    default:
      return true;
  }
}

/** ベッドルーム数（「4」= 4 以上） */
export function matchesBedroomsFilter(property: Pick<Property, 'beds'>, bedrooms: string): boolean {
  const raw = bedrooms.trim();
  if (!raw) return true;
  if (raw === '4') return property.beds >= 4;
  const n = parseInt(raw, 10);
  if (Number.isNaN(n)) return true;
  return property.beds === n;
}
