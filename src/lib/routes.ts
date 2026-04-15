/**
 * ページとURLパスの対応。ブラウザの履歴と同期してページごとにURLを変える。
 */
/** App の handleNavigate に渡すオプション（ブログ・カテゴリーはパス、相談ページのみクエリ） */
export type NavigateOptions = {
  categoryId?: string;
  blogPostId?: number;
  /** /consultation?from=blog&post=&slug= */
  consultationFromBlog?: boolean;
  consultationPostId?: number;
  consultationSlug?: string;
};

export type Page =
  | 'home'
  | 'buy'
  | 'rent'
  | 'consultation'
  | 'category'
  | 'blog'
  | 'about'
  | 'htmlSitemap'
  | 'cookie'
  | 'terms'
  | 'privacy'
  | 'account'
  | 'signup'
  | 'favorites'
  | 'activity'
  | 'profile';

const PATH_TO_PAGE: Record<string, Page> = {
  '/': 'home',
  '/buy': 'buy',
  '/rent': 'rent',
  '/consultation': 'consultation',
  '/category': 'category',
  '/blog': 'blog',
  '/about': 'about',
  '/site-map': 'htmlSitemap',
  '/account': 'account',
  '/signup': 'signup',
  '/favorites': 'favorites',
  '/activity': 'activity',
  '/profile': 'profile',
  '/cookie-policy': 'cookie',
  '/terms': 'terms',
  '/privacy': 'privacy',
};

/** pathname から言語プレフィックスを除いたパス（常に / で始まる） */
export function localeStrippedPath(pathname: string): string {
  if (pathname === '/zh') return '/';
  if (pathname.startsWith('/zh/')) return pathname.slice(3);
  return pathname;
}

/** 物件詳細の正規 URL: /rent/123, /zh/buy/456 など（従来の ?property= は parse 側で互換） */
export function getPathForPropertyDetail(
  source: 'rent' | 'buy',
  propertyId: number,
  language?: string
): string {
  const segment = source === 'rent' ? 'rent' : 'buy';
  const path = `/${segment}/${propertyId}`;
  if (language === 'zh') return `/zh${path}`;
  return path;
}

/** ブログ記事: /blog/123、中国語は /zh/blog/123（レガシー ?post= は廃止） */
export function getPathForBlogPost(postId: number, language?: string): string {
  const path = `/blog/${postId}`;
  if (language === 'zh') return `/zh${path}`;
  return path;
}

/**
 * カテゴリー一覧: /category または /category/featured
 * スラッグは英数字・ハイフンのみ想定（クエリ形式は廃止）
 */
export function getPathForCategory(categoryId: string | undefined, language?: string): string {
  const path = categoryId ? `/category/${categoryId.replace(/^\/+|\/+$/g, '')}` : '/category';
  if (language === 'zh') return path === '/category' ? '/zh/category' : `/zh${path}`;
  return path;
}

/** /blog/42 または /blog/post-42 → 記事 ID（レガシー互換で post- 接頭辞のみ） */
export function parseBlogPostIdFromPath(pathname: string): number | null {
  const base = localeStrippedPath(pathname);
  const normalized = base.replace(/\/$/, '') || '/';
  let m = normalized.match(/^\/blog\/(\d+)$/);
  if (m) {
    const id = Number(m[1]);
    if (!Number.isNaN(id)) return id;
  }
  m = normalized.match(/^\/blog\/post-(\d+)$/i);
  if (m) {
    const id = Number(m[1]);
    if (!Number.isNaN(id)) return id;
  }
  return null;
}

/** /category/featured → featured */
export function parseCategorySlugFromPath(pathname: string): string | null {
  const base = localeStrippedPath(pathname);
  const normalized = base.replace(/\/$/, '') || '/';
  const m = normalized.match(/^\/category\/([^/]+)$/);
  if (!m) return null;
  try {
    return decodeURIComponent(m[1]);
  } catch {
    return m[1];
  }
}

/**
 * 物件詳細: /rent/[id], /buy/[id] または ?property=&source=
 */
export function parsePropertyDetailFromLocation(
  pathname: string,
  searchParams: URLSearchParams
): { propertyId: number | null; source: 'rent' | 'buy' | null } {
  const base = localeStrippedPath(pathname);
  const normalized = base.replace(/\/$/, '') || '/';
  let m = normalized.match(/^\/rent\/(\d+)$/);
  if (m) {
    const id = Number(m[1]);
    if (!Number.isNaN(id)) return { propertyId: id, source: 'rent' };
  }
  m = normalized.match(/^\/buy\/(\d+)$/);
  if (m) {
    const id = Number(m[1]);
    if (!Number.isNaN(id)) return { propertyId: id, source: 'buy' };
  }
  const qId = searchParams.get('property');
  const qSource = searchParams.get('source');
  if (qId && !Number.isNaN(Number(qId)) && (qSource === 'rent' || qSource === 'buy')) {
    return { propertyId: Number(qId), source: qSource };
  }
  return { propertyId: null, source: null };
}

const PAGE_TO_PATH: Record<Page, string> = {
  home: '/',
  buy: '/buy',
  rent: '/rent',
  consultation: '/consultation',
  category: '/category',
  blog: '/blog',
  about: '/about',
  htmlSitemap: '/site-map',
  account: '/account',
  signup: '/signup',
  favorites: '/favorites',
  activity: '/activity',
  profile: '/profile',
  cookie: '/cookie-policy',
  terms: '/terms',
  privacy: '/privacy',
};

export function getPageFromPath(pathname: string): Page {
  const base = localeStrippedPath(pathname);
  const normalized = base.replace(/\/$/, '') || '/';
  if (/^\/rent\/\d+$/.test(normalized)) return 'rent';
  if (/^\/buy\/\d+$/.test(normalized)) return 'buy';
  if (/^\/blog(?:\/\d+|\/post-\d+)$/i.test(normalized)) return 'blog';
  if (/^\/category\/[^/]+$/.test(normalized)) return 'category';
  return PATH_TO_PAGE[normalized] ?? 'home';
}

export function getPathFromPage(page: Page, language?: string): string {
  const path = PAGE_TO_PATH[page];
  if (language === 'zh') {
    return path === '/' ? '/zh' : `/zh${path}`;
  }
  return path;
}

export function getPathname(): string {
  return window.location.pathname;
}

export function pushState(path: string, search?: string): void {
  const url = search ? `${path}${search.startsWith('?') ? search : `?${search}`}` : path;
  window.history.pushState({ path, search: search ?? '' }, '', url);
}

export function replaceState(path: string, search?: string): void {
  const url = search ? `${path}${search.startsWith('?') ? search : `?${search}`}` : path;
  window.history.replaceState({ path, search: search ?? '' }, '', url);
}
