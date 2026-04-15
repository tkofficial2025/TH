/**
 * public/sitemap.xml と public/robots.txt を生成する。
 * ビルド前に public/blog-posts.json が存在すること（generate-blog-posts の後に実行）。
 *
 * 本番の絶対 URL は VITE_SITE_URL で上書き可能。未設定時は https://www.tokyoexhousing.com（canonical と揃え www）を使う。
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');
const blogJsonPath = path.join(publicDir, 'blog-posts.json');
const categorySeoJsonPath = path.join(projectRoot, 'src', 'data', 'category-seo-slugs.json');

function loadEnvFile() {
  const envPath = path.join(projectRoot, '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnvFile();

// ユーザー専用・法務フッター等はインデックス対象外のためサイトマップに含めない（/zh 付きも同様に出さない）
/** path ごとの priority / changefreq（Google クロール優先度の目安） */
const STATIC_PAGE_RULES = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/buy', priority: '0.9', changefreq: 'daily' },
  { path: '/rent', priority: '0.9', changefreq: 'daily' },
  { path: '/category', priority: '0.8', changefreq: 'daily' },
  { path: '/blog', priority: '0.8', changefreq: 'daily' },
  { path: '/about', priority: '0.5', changefreq: 'monthly' },
  { path: '/consultation', priority: '0.5', changefreq: 'monthly' },
  { path: '/site-map', priority: '0.45', changefreq: 'weekly' },
];

const CATEGORY_IDS = JSON.parse(fs.readFileSync(categorySeoJsonPath, 'utf8'));
if (!Array.isArray(CATEGORY_IDS) || !CATEGORY_IDS.length) {
  throw new Error('src/data/category-seo-slugs.json must be a non-empty JSON array');
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** アプリの getCanonicalOrigin と同様: https + apex なら www */
function normalizeSiteOrigin(raw) {
  const DEFAULT = 'https://www.tokyoexhousing.com';
  const input = (raw || DEFAULT).trim();
  try {
    const u = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
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
    return DEFAULT;
  }
}

function fullUrl(origin, pathname, search = '') {
  const base = origin.replace(/\/$/, '');
  const p = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return base + p + (search || '');
}

function zhPath(enPath) {
  if (enPath === '/') return '/zh';
  return `/zh${enPath}`;
}

/** 物件詳細: /rent/[id], /buy/[id]（英・中）。Supabase 未設定時は空。 */
async function fetchPropertyDetailEntries(origin) {
  const supabaseUrl = (process.env.VITE_SUPABASE_URL || '').trim();
  const anonKey = (process.env.VITE_SUPABASE_ANON_KEY || '').trim();
  if (!supabaseUrl || !anonKey) {
    console.warn(
      '⚠️ VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY が未設定のため、物件詳細 URL はサイトマップに含めません。'
    );
    return [];
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, anonKey);

  /** @type {{ locEn: string, locZh: string, changefreq: string, priority: string }[]} */
  const out = [];
  const pageSize = 500;
  let from = 0;

  for (;;) {
    const { data, error } = await supabase
      .from('properties')
      .select('id,type')
      .order('id', { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) {
      console.warn('generate-sitemap: properties の取得に失敗しました:', error.message);
      break;
    }

    const rows = data || [];
    if (rows.length === 0) break;

    for (const row of rows) {
      const id = row.id;
      if (id == null || Number.isNaN(Number(id))) continue;
      const typeRaw = String(row.type ?? 'rent').toLowerCase();
      const source = typeRaw === 'buy' ? 'buy' : 'rent';
      const path = source === 'rent' ? `/rent/${id}` : `/buy/${id}`;
      out.push({
        locEn: fullUrl(origin, path),
        locZh: fullUrl(origin, zhPath(path)),
        changefreq: 'weekly',
        priority: '0.7',
      });
    }

    if (rows.length < pageSize) break;
    from += pageSize;
  }

  return out;
}

async function collectUrls(origin) {
  /** @type {{ locEn: string, locZh: string, changefreq: string, priority: string }[]} */
  const entries = [];

  for (const { path, priority, changefreq } of STATIC_PAGE_RULES) {
    entries.push({
      locEn: fullUrl(origin, path),
      locZh: fullUrl(origin, zhPath(path)),
      changefreq,
      priority,
    });
  }

  for (const id of CATEGORY_IDS) {
    const pathEn = `/category/${id}`;
    entries.push({
      locEn: fullUrl(origin, pathEn),
      locZh: fullUrl(origin, zhPath(pathEn)),
      changefreq: 'daily',
      priority: '0.8',
    });
  }

  if (fs.existsSync(blogJsonPath)) {
    try {
      const { posts } = JSON.parse(fs.readFileSync(blogJsonPath, 'utf8'));
      if (Array.isArray(posts)) {
        for (const post of posts) {
          const id = post?.id;
          if (id == null || Number.isNaN(Number(id))) continue;
          const pathEn = `/blog/${id}`;
          entries.push({
            locEn: fullUrl(origin, pathEn),
            locZh: fullUrl(origin, zhPath(pathEn)),
            changefreq: 'weekly',
            priority: '0.7',
          });
        }
      }
    } catch (e) {
      console.warn('generate-sitemap: blog-posts.json の読み込みをスキップしました:', e.message);
    }
  }

  const propertyEntries = await fetchPropertyDetailEntries(origin);
  entries.push(...propertyEntries);

  return entries;
}

function buildSitemapXml(entries) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ];
  for (const { locEn, locZh, changefreq, priority } of entries) {
    const altBlock = [
      `    <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(locEn)}"/>`,
      `    <xhtml:link rel="alternate" hreflang="zh-CN" href="${escapeXml(locZh)}"/>`,
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(locEn)}"/>`,
    ];
    for (const loc of [locEn, locZh]) {
      lines.push('  <url>');
      lines.push(`    <loc>${escapeXml(loc)}</loc>`);
      lines.push(`    <changefreq>${changefreq}</changefreq>`);
      lines.push(`    <priority>${priority}</priority>`);
      lines.push(...altBlock);
      lines.push('  </url>');
    }
  }
  lines.push('</urlset>');
  return lines.join('\n') + '\n';
}

function buildRobotsTxt(origin) {
  const base = origin.replace(/\/$/, '');
  return [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${base}/sitemap.xml`,
    '',
  ].join('\n');
}

/** 環境変数未設定時の本番オリジン（canonical と揃え www） */
const DEFAULT_SITE_ORIGIN = 'https://www.tokyoexhousing.com';

async function main() {
  let raw = (process.env.VITE_SITE_URL || process.env.SITE_URL || '').trim();
  if (!raw) {
    raw = DEFAULT_SITE_ORIGIN;
    console.warn(
      `⚠️ VITE_SITE_URL 未設定のため、sitemap / robots は ${DEFAULT_SITE_ORIGIN} で出力しています。別ドメインの場合は .env に VITE_SITE_URL を設定してください。`
    );
  }
  const origin = normalizeSiteOrigin(raw);

  const entries = await collectUrls(origin);
  const xml = buildSitemapXml(entries);
  const robots = buildRobotsTxt(origin);

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml, 'utf8');
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), robots, 'utf8');

  console.log(
    `✅ sitemap.xml（${entries.length} 組の言語ペア・各組に en/zh の <url> と hreflang）と robots.txt を出力しました: ${publicDir}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
