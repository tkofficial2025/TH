import type { Property } from '@/lib/properties';
import type { PropertyTranslationResult } from '@/lib/translate-property';
import type { Language } from '@/lib/stationNames';

/**
 * 一覧の rent/buy 地図（PropertiesMapView）と物件カードの住所行を同じルールに揃える。
 * ジオコーディングは property.address（Supabase）を使用する。
 */
export function getListingAddressLineMatchingMap(
  property: Property,
  language: Language,
  translationMap?: Map<number, PropertyTranslationResult>
): string {
  if (language === 'zh' && translationMap?.get(property.id)?.address_zh) {
    return translationMap.get(property.id)!.address_zh;
  }
  return property.address ?? '';
}
