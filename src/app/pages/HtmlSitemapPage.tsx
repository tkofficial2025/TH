import { useEffect, useState } from 'react';
import { Header } from '@/app/components/Header';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import { stripHtml } from '@/lib/stripHtml';
import { CATEGORY_SEO_SLUGS, CATEGORY_SEO_LABEL_KEY } from '@/lib/seoCategoryNav';
import {
  getPathForBlogPost,
  getPathForCategory,
  getPathForPropertyDetail,
  getPathFromPage,
  type NavigateOptions,
  type Page,
} from '@/lib/routes';

type BlogRow = { id: number; title?: { rendered?: string } };

const MAIN_PAGES: Page[] = ['home', 'buy', 'rent', 'blog', 'about', 'consultation', 'category'];

interface HtmlSitemapPageProps {
  onNavigate: (page: Page, options?: NavigateOptions) => void;
}

export function HtmlSitemapPage({ onNavigate }: HtmlSitemapPageProps) {
  const { t, language } = useLanguage();
  const zh = language === 'zh' ? 'zh' : undefined;
  const [posts, setPosts] = useState<BlogRow[]>([]);
  const [properties, setProperties] = useState<{ id: number; source: 'rent' | 'buy' }[]>([]);
  const [propError, setPropError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/blog-posts.json?t=${Date.now()}`)
      .then((r) => r.json())
      .then((data: { posts?: BlogRow[] }) => {
        if (cancelled || !Array.isArray(data?.posts)) return;
        setPosts(
          data.posts
            .filter((p) => p?.id != null && !Number.isNaN(Number(p.id)))
            .map((p) => ({ id: Number(p.id), title: p.title }))
        );
      })
      .catch(() => {
        if (!cancelled) setPosts([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setPropError(null);
      const out: { id: number; source: 'rent' | 'buy' }[] = [];
      const pageSize = 500;
      let from = 0;
      for (;;) {
        const { data, error } = await supabase
          .from('properties')
          .select('id,type')
          .order('id', { ascending: true })
          .range(from, from + pageSize - 1);
        if (error) {
          if (!cancelled) setPropError(error.message);
          break;
        }
        const rows = data || [];
        for (const row of rows) {
          const id = Number(row.id);
          if (Number.isNaN(id)) continue;
          const typeRaw = String(row.type ?? 'rent').toLowerCase();
          const source = typeRaw === 'buy' ? 'buy' : 'rent';
          out.push({ id, source });
        }
        if (rows.length < pageSize) break;
        from += pageSize;
        if (from > 8000) break;
      }
      if (!cancelled) setProperties(out);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const pageLabel = (page: Page): string => {
    switch (page) {
      case 'home':
        return t('nav.home');
      case 'buy':
        return t('nav.buy');
      case 'rent':
        return t('nav.rent');
      case 'blog':
        return t('nav.blog');
      case 'about':
        return t('nav.about');
      case 'consultation':
        return t('nav.consultation');
      case 'category':
        return t('seo.sitemap.category_index');
      default:
        return page;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header onNavigate={onNavigate} />
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-24 md:pt-28">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">{t('seo.sitemap.title')}</h1>
        <p className="mb-10 text-sm text-gray-600">{t('seo.sitemap.intro')}</p>

        <section className="mb-10" aria-labelledby="sitemap-main">
          <h2 id="sitemap-main" className="mb-3 text-lg font-semibold text-gray-900">
            {t('seo.sitemap.section_main')}
          </h2>
          <ul className="list-inside list-disc space-y-2 text-sm text-gray-800">
            {MAIN_PAGES.map((page) => (
              <li key={page}>
                <a href={getPathFromPage(page, zh)} className="text-[#C1121F] underline-offset-2 hover:underline">
                  {pageLabel(page)}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-10" aria-labelledby="sitemap-categories">
          <h2 id="sitemap-categories" className="mb-3 text-lg font-semibold text-gray-900">
            {t('seo.sitemap.section_categories')}
          </h2>
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {CATEGORY_SEO_SLUGS.map((slug) => (
              <li key={slug}>
                <a href={getPathForCategory(slug, zh)} className="text-[#C1121F] underline-offset-2 hover:underline">
                  {t(CATEGORY_SEO_LABEL_KEY[slug] ?? slug)}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-10" aria-labelledby="sitemap-blog">
          <h2 id="sitemap-blog" className="mb-3 text-lg font-semibold text-gray-900">
            {t('seo.sitemap.section_blog')}
          </h2>
          {posts.length === 0 ? (
            <p className="text-sm text-gray-500">{t('seo.sitemap.loading')}</p>
          ) : (
            <ul className="space-y-2 text-sm">
              <li>
                <a href={getPathFromPage('blog', zh)} className="font-medium text-gray-900 underline-offset-2 hover:underline">
                  {t('nav.blog')} ({t('seo.sitemap.index')})
                </a>
              </li>
              {posts.map((p) => (
                <li key={p.id}>
                  <a href={getPathForBlogPost(p.id, zh)} className="text-[#C1121F] underline-offset-2 hover:underline">
                    {p.title?.rendered ? stripHtml(p.title.rendered) : `#${p.id}`}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mb-6" aria-labelledby="sitemap-properties">
          <h2 id="sitemap-properties" className="mb-3 text-lg font-semibold text-gray-900">
            {t('seo.sitemap.section_properties')}
          </h2>
          <p className="mb-3 text-sm text-gray-600">{t('seo.sitemap.properties_note')}</p>
          {propError && <p className="mb-3 text-sm text-amber-800">{t('seo.sitemap.properties_error').replace('{msg}', propError)}</p>}
          {properties.length === 0 && !propError ? (
            <p className="text-sm text-gray-500">{t('seo.sitemap.loading')}</p>
          ) : (
            <ul className="columns-2 gap-x-6 text-sm sm:columns-3">
              {properties.map((p) => (
                <li key={`${p.source}-${p.id}`} className="mb-1.5 break-inside-avoid">
                  <a href={getPathForPropertyDetail(p.source, p.id, zh)} className="text-[#C1121F] underline-offset-2 hover:underline">
                    {p.source === 'rent' ? 'R' : 'B'} · {p.id}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="text-xs text-gray-500">
          <a href="/sitemap.xml" className="underline-offset-2 hover:underline">
            XML Sitemap
          </a>
        </p>
      </main>
    </div>
  );
}
