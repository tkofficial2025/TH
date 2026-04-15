import { useEffect, useState } from 'react';
import { getPathForBlogPost, getPathForCategory, getPathForPropertyDetail, getPathFromPage } from '@/lib/routes';
import { CATEGORY_SEO_SLUGS, CATEGORY_SEO_LABEL_KEY } from '@/lib/seoCategoryNav';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { stripHtml } from '@/lib/stripHtml';

type BlogRow = { id: number; title?: { rendered?: string } };

/**
 * トップページ下部: クローラ向けに実 URL の <a href> を並べる（本文は簡潔に）。
 */
export function HomeCrawlableLinksSection() {
  const { t, language } = useLanguage();
  const zh = language === 'zh' ? 'zh' : undefined;
  const [posts, setPosts] = useState<BlogRow[]>([]);
  const [props, setProps] = useState<{ id: number; source: 'rent' | 'buy' }[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/blog-posts.json?t=${Date.now()}`)
      .then((r) => r.json())
      .then((data: { posts?: BlogRow[] }) => {
        if (cancelled || !Array.isArray(data?.posts)) return;
        setPosts(
          data.posts
            .filter((p) => p?.id != null && !Number.isNaN(Number(p.id)))
            .slice(0, 12)
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
      const featured = await supabase.from('properties').select('id,type').eq('is_featured', true).limit(24);
      let rows = featured.data ?? [];
      if (rows.length === 0 && !featured.error) {
        const fb = await supabase.from('properties').select('id,type').order('created_at', { ascending: false }).limit(24);
        rows = fb.data ?? [];
      }
      if (cancelled) return;
      setProps(
        rows
          .map((row: { id: unknown; type?: unknown }) => {
            const id = Number(row.id);
            if (Number.isNaN(id)) return null;
            const typeRaw = String(row.type ?? 'rent').toLowerCase();
            const source = typeRaw === 'buy' ? 'buy' : 'rent';
            return { id, source };
          })
          .filter(Boolean) as { id: number; source: 'rent' | 'buy' }[]
      );
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="border-t border-gray-200 bg-white py-10 md:py-14" aria-labelledby="home-crawlable-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="home-crawlable-heading" className="sr-only">
          {t('seo.home.crawl_section_sr')}
        </h2>

        <div className="grid gap-10 md:grid-cols-2 lg:gap-14">
          <div>
            <h3 className="mb-3 text-lg font-semibold text-gray-900">{t('seo.home.crawl_blog_title')}</h3>
            <p className="mb-4 text-sm text-gray-600">{t('seo.home.crawl_blog_desc')}</p>
            {posts.length === 0 ? (
              <p className="text-sm text-gray-500">{t('seo.home.crawl_loading')}</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {posts.map((p) => (
                  <li key={p.id}>
                    <a
                      href={getPathForBlogPost(p.id, zh)}
                      className="text-[#C1121F] underline-offset-2 hover:text-[#9f121b] hover:underline"
                    >
                      {p.title?.rendered ? stripHtml(p.title.rendered) : `${t('nav.blog')} #${p.id}`}
                    </a>
                  </li>
                ))}
                <li>
                  <a href={getPathFromPage('blog', zh)} className="font-medium text-gray-800 underline-offset-2 hover:underline">
                    {t('seo.home.crawl_blog_index')}
                  </a>
                </li>
              </ul>
            )}
          </div>

          <div>
            <h3 className="mb-3 text-lg font-semibold text-gray-900">{t('seo.home.crawl_properties_title')}</h3>
            <p className="mb-4 text-sm text-gray-600">{t('seo.home.crawl_properties_desc')}</p>
            {props.length === 0 ? (
              <p className="text-sm text-gray-500">{t('seo.home.crawl_loading')}</p>
            ) : (
              <ul className="columns-1 gap-x-8 sm:columns-2">
                {props.map((p) => (
                  <li key={`${p.source}-${p.id}`} className="mb-2 break-inside-avoid text-sm">
                    <a
                      href={getPathForPropertyDetail(p.source, p.id, zh)}
                      className="text-[#C1121F] underline-offset-2 hover:text-[#9f121b] hover:underline"
                    >
                      {p.source === 'rent' ? t('nav.rent') : t('nav.buy')} · ID {p.id}
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
              <li>
                <a href={getPathFromPage('rent', zh)} className="text-gray-800 underline-offset-2 hover:underline">
                  {t('seo.home.crawl_rent_index')}
                </a>
              </li>
              <li>
                <a href={getPathFromPage('buy', zh)} className="text-gray-800 underline-offset-2 hover:underline">
                  {t('seo.home.crawl_buy_index')}
                </a>
              </li>
              <li>
                <a href={getPathForCategory('featured', zh)} className="text-gray-800 underline-offset-2 hover:underline">
                  {t('seo.home.crawl_featured_category')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-100 pt-8">
          <h3 className="mb-3 text-lg font-semibold text-gray-900">{t('seo.home.crawl_categories_title')}</h3>
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {CATEGORY_SEO_SLUGS.map((slug) => (
              <li key={slug}>
                <a
                  href={getPathForCategory(slug, zh)}
                  className="text-gray-800 underline-offset-2 hover:text-[#C1121F] hover:underline"
                >
                  {t(CATEGORY_SEO_LABEL_KEY[slug] ?? slug)}
                </a>
              </li>
            ))}
            <li>
              <a href={getPathFromPage('htmlSitemap', zh)} className="font-medium text-[#C1121F] underline-offset-2 hover:underline">
                {t('seo.home.crawl_full_sitemap')}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
