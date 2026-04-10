/**
 * public/sitemap.xml と public/robots.txt を生成する。
 * ビルド前に public/blog-posts.json が存在すること（generate-blog-posts の後に実行）。
 *
 * 本番の絶対 URL には VITE_SITE_URL（例: https://www.example.com）を .env に設定する。
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');
const blogJsonPath = path.join(publicDir, 'blog-posts.json');

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

const STATIC_PATHS = [
  '/',
  '/buy',
  '/rent',
  '/consultation',
  '/category',
  '/blog',
  '/about',
  '/account',
  '/signup',
  '/favorites',
  '/activity',
  '/profile',
  '/cookie-policy',
  '/terms',
  '/privacy',
];

const CATEGORY_IDS = [
  'featured',
  'luxury',
  'pet-friendly',
  'furnished',
  'top-floor',
  'no-key-money',
  'for-students',
  'designers',
  'for-families',
];

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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

function collectUrls(origin) {
  /** @type {{ loc: string, changefreq: string, priority: string }[]} */
  const entries = [];

  for (const p of STATIC_PATHS) {
    for (const localized of [p, zhPath(p)]) {
      entries.push({
        loc: fullUrl(origin, localized),
        changefreq: p === '/' ? 'daily' : 'weekly',
        priority: p === '/' ? '1.0' : '0.8',
      });
    }
  }

  for (const id of CATEGORY_IDS) {
    const q = `?category=${encodeURIComponent(id)}`;
    for (const base of ['/category', zhPath('/category')]) {
      entries.push({
        loc: fullUrl(origin, base, q),
        changefreq: 'weekly',
        priority: '0.7',
      });
    }
  }

  if (fs.existsSync(blogJsonPath)) {
    try {
      const { posts } = JSON.parse(fs.readFileSync(blogJsonPath, 'utf8'));
      if (Array.isArray(posts)) {
        for (const post of posts) {
          const id = post?.id;
          if (id == null || Number.isNaN(Number(id))) continue;
          const q = `?post=${encodeURIComponent(String(id))}`;
          for (const base of ['/blog', zhPath('/blog')]) {
            entries.push({
              loc: fullUrl(origin, base, q),
              changefreq: 'monthly',
              priority: '0.6',
            });
          }
        }
      }
    } catch (e) {
      console.warn('generate-sitemap: blog-posts.json の読み込みをスキップしました:', e.message);
    }
  }

  return entries;
}

function buildSitemapXml(entries) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];
  for (const { loc, changefreq, priority } of entries) {
    lines.push('  <url>');
    lines.push(`    <loc>${escapeXml(loc)}</loc>`);
    lines.push(`    <changefreq>${changefreq}</changefreq>`);
    lines.push(`    <priority>${priority}</priority>`);
    lines.push('  </url>');
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

function main() {
  let origin = (process.env.VITE_SITE_URL || process.env.SITE_URL || '').trim();
  if (!origin) {
    origin = 'https://example.com';
    console.warn(
      '⚠️ VITE_SITE_URL（または SITE_URL）が未設定のため、sitemap / robots は example.com で出力しています。.env に本番 URL を設定してください。'
    );
  }

  const entries = collectUrls(origin);
  const xml = buildSitemapXml(entries);
  const robots = buildRobotsTxt(origin);

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml, 'utf8');
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), robots, 'utf8');

  console.log(`✅ sitemap.xml（${entries.length} URL）と robots.txt を出力しました: ${publicDir}`);
}

main();
