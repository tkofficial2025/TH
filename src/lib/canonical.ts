import type { Page } from '@/lib/routes';
import {
  getPathForBlogPost,
  getPathForCategory,
  getPathForPropertyDetail,
  getPathFromPage,
} from '@/lib/routes';

const DEFAULT_CANONICAL_ORIGIN = 'https://www.tokyoexhousing.com';

/**
 * 正規 URL のオリジン。VITE_SITE_URL を https + www（apex のみ）に揃える。
 */
export function getCanonicalOrigin(): string {
  const raw = (import.meta.env.VITE_SITE_URL as string | undefined)?.trim() || DEFAULT_CANONICAL_ORIGIN;
  try {
    const u = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    let host = u.hostname.toLowerCase();
    const parts = host.split('.');
    if (parts.length === 2 && !host.startsWith('www.')) {
      host = `www.${host}`;
    }
    u.protocol = 'https:';
    u.hostname = host;
    u.pathname = '';
    u.search = '';
    u.hash = '';
    u.port = '';
    return u.origin;
  } catch {
    return DEFAULT_CANONICAL_ORIGIN;
  }
}

export function buildCanonicalHref(args: {
  language: string;
  currentPage: Page;
  selectedPropertyId: number | null;
  detailSource: 'rent' | 'buy';
  selectedBlogPostId: number | null;
  selectedCategory: string | null;
}): string {
  const origin = getCanonicalOrigin();
  const lang = args.language === 'zh' ? 'zh' : undefined;

  if (args.selectedPropertyId != null) {
    return `${origin}${getPathForPropertyDetail(args.detailSource, args.selectedPropertyId, lang)}`;
  }

  if (args.currentPage === 'consultation' && typeof window !== 'undefined') {
    const p = window.location.pathname || '/';
    const s = window.location.search || '';
    return `${origin}${p}${s}`;
  }

  if (args.currentPage === 'blog' && args.selectedBlogPostId != null) {
    return `${origin}${getPathForBlogPost(args.selectedBlogPostId, lang)}`;
  }

  if (args.currentPage === 'category') {
    return `${origin}${getPathForCategory(args.selectedCategory ?? undefined, lang)}`;
  }

  return `${origin}${getPathFromPage(args.currentPage, lang)}`;
}
