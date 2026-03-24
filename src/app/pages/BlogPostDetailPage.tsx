import { useEffect, useState } from 'react';
import { Header } from '@/app/components/Header';
import { ArrowLeft, ArrowRight, Calendar, CheckCircle2, Sparkles, Tag } from 'lucide-react';
import { getBlogPostById } from '@/lib/blogPosts';
import { useLanguage } from '@/app/contexts/LanguageContext';
import type { NavigateOptions, Page } from '@/lib/routes';
import { stripHtml } from '@/lib/stripHtml';

interface BlogPost {
  id: number;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  date: string;
  link: string;
  featured_media: number;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
    }>;
    'wp:term'?: Array<Array<{
      id: number;
      name: string;
      slug: string;
    }>>;
  };
}

interface BlogPostDetailPageProps {
  postId: number;
  onNavigate: (page: Page, options?: NavigateOptions) => void;
  onBack: () => void;
}

export function BlogPostDetailPage({ postId, onNavigate, onBack }: BlogPostDetailPageProps) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStickyCta, setShowStickyCta] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setLoading(true);
    setError(null);

    getBlogPostById(postId)
      .then((data) => {
        if (data) {
          setPost(data);
        } else {
          setError('記事が見つかりませんでした。');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('記事取得エラー:', err);
        setError('記事の読み込みに失敗しました。');
        setLoading(false);
      });
  }, [postId]);

  useEffect(() => {
    const onScroll = () => {
      setShowStickyCta(window.scrollY > 300);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getFeaturedImage = (p: BlogPost) => {
    return p._embedded?.['wp:featuredmedia']?.[0]?.source_url || null;
  };

  const getPostCategories = (p: BlogPost) => {
    return p._embedded?.['wp:term']?.[0] || [];
  };

  const goConsultation = (p: BlogPost) => {
    const slug = p.link?.replace(/^\/blog\//, '') || undefined;
    onNavigate('consultation', {
      consultationFromBlog: true,
      consultationPostId: p.id,
      consultationSlug: slug,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-stone-50/80">
        <Header onNavigate={onNavigate} currentPage="blog" />
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-10 xl:max-w-6xl 2xl:max-w-7xl pt-20 pb-12 md:pt-28 md:pb-16">
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-9 w-9 border-2 border-[#C1121F] border-t-transparent" />
            <p className="mt-5 text-sm text-gray-600">{t('blog.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-stone-50/80">
        <Header onNavigate={onNavigate} currentPage="blog" />
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-10 xl:max-w-6xl 2xl:max-w-7xl py-12 md:py-16">
          <div className="rounded-2xl border border-red-100 bg-red-50/80 px-5 py-4 text-red-900 shadow-sm">
            <p className="text-sm font-semibold">{t('blog.error')}</p>
            <p className="mt-1 text-sm text-red-800/90">
              {error ? t(error === 'not_found' ? 'blog.not_found' : 'blog.error_desc') : t('blog.not_found')}
            </p>
          </div>
          <button
            onClick={onBack}
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-stone-50"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('blog.back_to_list')}
          </button>
        </div>
      </div>
    );
  }

  const featuredImage = getFeaturedImage(post);
  const postCategories = getPostCategories(post);
  const titlePlain = stripHtml(post.title.rendered);

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-stone-50/80 pb-20 md:pb-8">
      <Header onNavigate={onNavigate} currentPage="blog" />

      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-10 xl:max-w-6xl 2xl:max-w-7xl pt-20 pb-12 md:pt-28 md:pb-16">
        <button
          type="button"
          onClick={onBack}
          className="relative z-10 group mb-10 inline-flex items-center gap-2 rounded-full border border-stone-200/80 bg-white/80 px-4 py-2 text-sm font-medium text-gray-600 shadow-sm backdrop-blur-sm transition hover:border-stone-300 hover:bg-white hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          {t('blog.back_to_list')}
        </button>

        <article className="overflow-hidden rounded-2xl border border-stone-200/60 bg-white shadow-[0_1px_0_rgba(0,0,0,0.04),0_12px_40px_-12px_rgba(0,0,0,0.08)]">
          <div className="border-b border-stone-100 bg-gradient-to-br from-stone-50/90 to-white px-6 py-8 sm:px-10 sm:py-10 md:px-12">
            {postCategories.length > 0 && (
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <span className="h-px w-8 rounded-full bg-[#C1121F]" aria-hidden />
                <div className="flex flex-wrap gap-2">
                  {postCategories.map((cat) => (
                    <span
                      key={cat.id}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#C1121F]/15 bg-[#C1121F]/[0.06] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#9f121b]"
                    >
                      <Tag className="h-3.5 w-3.5 opacity-80" />
                      {cat.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <h1
              className="text-balance text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-[2.35rem] md:leading-[1.15]"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />

            <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-gray-500">
              <span className="inline-flex items-center gap-2 rounded-full bg-stone-100/80 px-3 py-1.5 text-gray-600">
                <Calendar className="h-4 w-4 text-gray-400" />
                <time dateTime={post.date}>{formatDate(post.date)}</time>
              </span>
            </div>
          </div>

          {featuredImage && (
            <div className="border-b border-stone-100 bg-stone-50/50 px-4 py-6 sm:px-8 md:px-10 lg:px-12">
              <div className="overflow-hidden rounded-xl shadow-inner ring-1 ring-black/[0.04]">
                <img
                  src={featuredImage}
                  alt={titlePlain}
                  className="h-auto w-full max-h-[min(28rem,70vh)] object-cover"
                />
              </div>
            </div>
          )}

          <div className="px-6 py-8 sm:px-10 sm:py-10 md:px-12 lg:px-14 xl:px-16">
            <div className="mb-8 rounded-xl border border-[#C1121F]/12 bg-gradient-to-br from-[#C1121F]/[0.04] to-white p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#C1121F]/10 text-[#C1121F]">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900">{t('blog.cta_inline_title')}</p>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">{t('blog.cta_inline_desc')}</p>
                  <button
                    type="button"
                    onClick={() => goConsultation(post)}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#C1121F] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#A00F1A]"
                  >
                    {t('blog.cta_button')}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div
              className="blog-post-content mx-auto w-full max-w-[min(100%,65ch)] md:max-w-[min(100%,72ch)] xl:max-w-[min(100%,80ch)] 2xl:max-w-[min(100%,88ch)]"
              dangerouslySetInnerHTML={{ __html: post.content.rendered }}
            />

            <div className="mx-auto mt-16 w-full max-w-[min(100%,65ch)] md:max-w-[min(100%,72ch)] xl:max-w-[min(100%,80ch)] 2xl:max-w-[min(100%,88ch)] border-t border-stone-200 pt-12">
              <div className="rounded-2xl border border-stone-200/80 bg-gradient-to-b from-stone-50 to-white p-6 sm:p-8">
                <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                  {t('blog.cta_footer_title')}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 sm:text-base">{t('blog.cta_footer_desc')}</p>
                <ul className="mt-5 space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#C1121F]" />
                    {t('blog.cta_trust_1')}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#C1121F]" />
                    {t('blog.cta_trust_2')}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#C1121F]" />
                    {t('blog.cta_trust_3')}
                  </li>
                </ul>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <button
                    type="button"
                    onClick={() => goConsultation(post)}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#C1121F] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#A00F1A]"
                  >
                    {t('blog.cta_button')}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('rent')}
                    className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-medium text-gray-800 transition hover:border-stone-400 hover:bg-stone-50"
                  >
                    {t('blog.cta_footer_rent')}
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('buy')}
                    className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-medium text-gray-800 transition hover:border-stone-400 hover:bg-stone-50"
                  >
                    {t('blog.cta_footer_buy')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>

      {showStickyCta && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-stone-200/80 bg-white/95 px-4 py-3 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-md md:hidden">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-2 sm:px-4">
            <p className="min-w-0 flex-1 text-xs font-medium text-gray-700 line-clamp-2">{titlePlain}</p>
            <button
              type="button"
              onClick={() => goConsultation(post)}
              className="shrink-0 rounded-full bg-[#C1121F] px-4 py-2.5 text-xs font-semibold text-white shadow-md"
            >
              {t('blog.cta_sticky')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
