import { useEffect, useState } from 'react';
import { Header } from '@/app/components/Header';
import { ArrowRight, Calendar, Sparkles, Tag } from 'lucide-react';
import { getBlogPosts } from '@/lib/blogPosts';
import { useLanguage } from '@/app/contexts/LanguageContext';
import type { NavigateOptions, Page } from '@/lib/routes';

export interface BlogPost {
  id: number;
  title: {
    rendered: string;
  };
  excerpt: {
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

interface BlogPageProps {
  onNavigate: (page: Page, options?: NavigateOptions) => void;
  onSelectPost?: (postId: number) => void;
}

export function BlogPage({ onNavigate, onSelectPost }: BlogPageProps) {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Array<{ id: number; name: string; slug: string }>>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // カテゴリーを取得
  useEffect(() => {
    getBlogPosts().then((allPosts) => {
      // 記事からカテゴリーを抽出
      const uniqueCategories = Array.from(
        new Set(
          allPosts
            .map((post) => post._embedded?.['wp:term']?.[0]?.[0]?.name)
            .filter(Boolean)
        )
      ).map((name, index) => ({
        id: index + 1,
        name: name as string,
        slug: (name as string).toLowerCase().replace(/\s+/g, '-'),
      }));
      setCategories(uniqueCategories);
    });
  }, []);

  // 記事を取得
  useEffect(() => {
    setLoading(true);
    setError(null);

    getBlogPosts()
      .then((allPosts) => {
        // カテゴリーでフィルタリング
        let filteredPosts = allPosts;
        if (selectedCategory) {
          filteredPosts = allPosts.filter((post) => {
            const postCategory = post._embedded?.['wp:term']?.[0]?.[0]?.name;
            return postCategory === selectedCategory;
          });
        }
        setPosts(filteredPosts);
        setLoading(false);
      })
      .catch((err) => {
        console.error('記事取得エラー:', err);
        setError(t('blog.error_desc'));
        setLoading(false);
      });
  }, [selectedCategory]);

  // HTMLをテキストに変換（簡易版）
  const stripHtml = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // 日付をフォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // 記事の画像URLを取得
  const getFeaturedImage = (post: BlogPost) => {
    return post._embedded?.['wp:featuredmedia']?.[0]?.source_url || null;
  };

  // 記事のカテゴリーを取得
  const getPostCategories = (post: BlogPost) => {
    return post._embedded?.['wp:term']?.[0] || [];
  };

  return (
    <div className="min-h-screen bg-white">
      <Header onNavigate={onNavigate} currentPage="blog" />

      <div className="max-w-7xl mx-auto px-6 pt-20 pb-12 md:pt-28 md:pb-16">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">{t('blog.title')}</h1>

        {/* カテゴリーフィルター */}
        <nav className="flex flex-wrap gap-4 mb-8 pb-4 border-b border-gray-200">
                        <button
                          onClick={() => setSelectedCategory(null)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            selectedCategory === null
                              ? 'bg-[#C1121F] text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {t('blog.all')}
                        </button>
                        {categories.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.name)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                              selectedCategory === category.name
                                ? 'bg-[#C1121F] text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {category.name}
                          </button>
                        ))}
        </nav>

        {/* エラーメッセージ */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            <p className="text-sm md:text-base font-semibold">{t('blog.error')}</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* ローディング */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#C1121F]"></div>
            <p className="mt-4 text-sm md:text-base text-gray-600">{t('blog.loading')}</p>
          </div>
        )}

        {/* 記事一覧 */}
        {!loading && !error && posts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-sm md:text-base font-semibold text-gray-600">{t('blog.preparing')}</p>
          </div>
        )}
        {!loading && !error && posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const featuredImage = getFeaturedImage(post);
              const postCategories = getPostCategories(post);
              const excerptText = stripHtml(post.excerpt?.rendered || post.content?.rendered || '').trim();
              const preview = excerptText.length > 140 ? `${excerptText.slice(0, 140)}...` : excerptText;

              return (
                <article
                  key={post.id}
                  className="group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                >
                  <button
                    type="button"
                    onClick={() => onSelectPost?.(post.id)}
                    className="w-full text-left"
                  >
                    <div className="h-48 bg-gray-100 overflow-hidden">
                      {featuredImage ? (
                        <img
                          src={featuredImage}
                          alt={stripHtml(post.title.rendered)}
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      {postCategories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {postCategories.map((cat) => (
                            <span
                              key={cat.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-medium"
                            >
                              <Tag className="w-3.5 h-3.5" />
                              {cat.name}
                            </span>
                          ))}
                        </div>
                      )}
                      <h2
                        className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                      />
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">{preview}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <time dateTime={post.date}>{formatDate(post.date)}</time>
                      </div>
                    </div>
                  </button>
                </article>
              );
            })}
          </div>
        )}

        {!loading && !error && (
          <section
            className="mt-16 rounded-2xl border border-stone-200/80 bg-gradient-to-br from-[#C1121F]/[0.06] via-white to-stone-50 p-8 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.1)] sm:p-10"
            aria-labelledby="blog-list-cta-heading"
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#9f121b] ring-1 ring-[#C1121F]/15">
                  <Sparkles className="h-3.5 w-3.5" />
                  Tokyo Expat Housing
                </div>
                <h2 id="blog-list-cta-heading" className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                  {t('blog.list_cta_title')}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 sm:text-base">{t('blog.list_cta_desc')}</p>
                <p className="mt-3 text-xs text-gray-500">{t('blog.list_cta_hint')}</p>
              </div>
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
                <button
                  type="button"
                  onClick={() => onNavigate('consultation', { consultationFromBlog: true })}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#C1121F] px-6 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-[#A00F1A]"
                >
                  {t('blog.list_cta_consult')}
                  <ArrowRight className="h-4 w-4" />
                </button>
                <div className="flex flex-col gap-2 sm:flex-row md:flex-col">
                  <button
                    type="button"
                    onClick={() => onNavigate('rent')}
                    className="rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-medium text-gray-800 transition hover:bg-stone-50"
                  >
                    {t('blog.list_cta_rent')}
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('buy')}
                    className="rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-medium text-gray-800 transition hover:bg-stone-50"
                  >
                    {t('blog.list_cta_buy')}
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
