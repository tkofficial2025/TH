import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { getBlogPosts } from '@/lib/blogPosts';
import type { BlogPost } from '@/app/pages/BlogPage';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { getPathForBlogPost, getPathFromPage } from '@/lib/routes';

const MAX_POSTS = 10;
const FALLBACK_IMAGE = '/tokyo.jpg';

function stripHtml(html: string) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || '').trim();
}

function featuredImage(post: BlogPost) {
  return post._embedded?.['wp:featuredmedia']?.[0]?.source_url || FALLBACK_IMAGE;
}

export function HomeBlogScrollSection() {
  const { t, language } = useLanguage();
  const pathLang = language === 'zh' ? 'zh' : undefined;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getBlogPosts()
      .then((all) => {
        if (cancelled) return;
        setPosts(all.slice(0, MAX_POSTS));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setShowLeft(scrollLeft > 8);
    setShowRight(scrollLeft < scrollWidth - clientWidth - 8);
  }, []);

  useEffect(() => {
    handleScroll();
  }, [posts, loading, handleScroll]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const scrollByDir = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const delta = Math.min(el.clientWidth * 0.85, 360) * (dir === 'left' ? -1 : 1);
    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  return (
    <section className="w-full min-w-0 overflow-hidden border-t border-gray-100 bg-gray-50 py-10 md:py-20">
      <div className="mx-auto max-w-7xl min-w-0 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between md:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mb-2 text-2xl font-bold text-gray-900 md:text-4xl lg:text-5xl">
              {t('section.home_blog.title')}
            </h2>
            <p className="text-xs text-gray-600 md:text-lg">{t('section.home_blog.subtitle')}</p>
          </motion.div>
          <motion.a
            href={getPathFromPage('blog', pathLang)}
            className="hidden items-center gap-2 text-gray-600 transition-colors hover:text-[#C1121F] md:flex"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            <span className="font-medium">{t('section.featured.view_all')}</span>
            <ArrowRight className="h-4 w-4" />
          </motion.a>
        </div>

        <div className="group/carousel relative -mx-2 px-2 md:mx-0 md:px-0">
          {showLeft && (
            <button
              type="button"
              onClick={() => scrollByDir('left')}
              className="absolute left-0 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-lg backdrop-blur-sm transition-all hover:scale-110 hover:bg-white lg:flex"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-6 w-6 text-gray-900" />
            </button>
          )}
          {showRight && posts.length > 1 && (
            <button
              type="button"
              onClick={() => scrollByDir('right')}
              className="absolute right-0 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-lg backdrop-blur-sm transition-all hover:scale-110 hover:bg-white lg:flex"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-6 w-6 text-gray-900" />
            </button>
          )}

          <div
            className="pointer-events-none absolute bottom-6 right-3 z-[1] flex items-center gap-1 text-xs font-medium text-gray-400 md:hidden"
            aria-hidden
          >
            <span>{t('section.home_blog.swipe')}</span>
            <ChevronRight className="h-4 w-4" />
          </div>
          <div
            className="pointer-events-none absolute bottom-0 right-0 top-0 z-[1] w-14 bg-gradient-to-l from-gray-50 to-transparent md:hidden"
            aria-hidden
          />

          <motion.div
            ref={scrollRef}
            onScroll={handleScroll}
            className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-4 pl-px md:gap-6"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.08 }}
          >
            {loading && (
              <div className="flex h-48 w-[280px] flex-shrink-0 snap-start items-center justify-center rounded-xl border border-gray-200 bg-white text-sm text-gray-500 md:w-[320px]">
                {t('section.home_blog.loading')}
              </div>
            )}
            {!loading && posts.length === 0 && (
              <div className="flex min-h-[12rem] w-full flex-shrink-0 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white text-sm text-gray-500">
                {t('section.home_blog.empty')}
              </div>
            )}
            {!loading &&
              posts.map((post, index) => (
                <motion.a
                  key={post.id}
                  href={getPathForBlogPost(post.id, pathLang)}
                  className="group/card w-[280px] flex-shrink-0 cursor-pointer snap-start md:w-[320px]"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.05 }}
                  whileHover={{ y: -6 }}
                >
                  <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-md transition-shadow duration-300 hover:border-gray-300 hover:shadow-xl">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <ImageWithFallback
                        src={featuredImage(post)}
                        alt={stripHtml(post.title.rendered)}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-4 md:p-5">
                      <div className="mb-2 flex items-center gap-1.5 text-xs text-gray-500">
                        <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                        <time dateTime={post.date}>{formatDate(post.date)}</time>
                      </div>
                      <h3 className="mb-2 line-clamp-2 text-base font-semibold leading-snug text-gray-900 transition-colors group-hover/card:text-[#C1121F] md:text-lg">
                        {stripHtml(post.title.rendered)}
                      </h3>
                      <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-gray-600">
                        {stripHtml(post.excerpt.rendered)}
                      </p>
                    </div>
                  </div>
                </motion.a>
              ))}
          </motion.div>
        </div>

        <div className="mt-6 flex justify-center md:hidden">
          <a
            href={getPathFromPage('blog', pathLang)}
            className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-800 shadow-sm transition-colors hover:border-[#C1121F] hover:text-[#C1121F]"
          >
            {t('section.featured.view_all')}
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
