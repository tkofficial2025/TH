import categorySeoSlugs from '@/data/category-seo-slugs.json';

/** サイトマップ・フッター・HTMLサイトマップで共通利用（generate-sitemap.js も同 JSON を参照） */
export const CATEGORY_SEO_SLUGS: readonly string[] = categorySeoSlugs;

/** i18n キー（LanguageContext）。featured のみセクション見出しを流用 */
export const CATEGORY_SEO_LABEL_KEY: Record<string, string> = {
  featured: 'section.featured.title',
  luxury: 'category.luxury',
  'pet-friendly': 'category.pet_friendly',
  furnished: 'category.furnished',
  'top-floor': 'category.high_rise',
  'no-key-money': 'category.no_key_money',
  'for-students': 'category.students',
  designers: 'category.designers',
  'for-families': 'category.families',
};
