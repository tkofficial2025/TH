import { useEffect, useState } from 'react';
import { Header } from '@/app/components/Header';
import { Calendar, Tag } from 'lucide-react';
import { getBlogPosts } from '@/lib/blogPosts';

interface BlogPostDetailPageProps {
  onNavigate: (page: 'home' | 'buy' | 'rent' | 'consultation' | 'category' | 'blog') => void;
  onSelectPost: (postId: number) => void;
}

interface BlogPost {
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
  onNavigate: (page: 'home' | 'buy' | 'rent' | 'consultation' | 'category' | 'blog') => void;
  onSelectPost?: (postId: number) => void;
}

export function BlogPage({ onNavigate, onSelectPost }: BlogPageProps) {
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
        setError('記事の読み込みに失敗しました。');
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

      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Blog</h1>

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
                          All
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
            <p className="font-semibold">エラー</p>
            <p className="text-sm">{error}</p>
            <p className="text-xs mt-2">
              WordPress API URL: {WORDPRESS_API_URL}
            </p>
          </div>
        )}

        {/* ローディング */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#C1121F]"></div>
            <p className="mt-4 text-gray-600">記事を読み込み中...</p>
          </div>
        )}

        {/* 記事グリッド */}
        {!loading && !error && (
          <>
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">記事が見つかりませんでした。</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => {
                  const featuredImage = getFeaturedImage(post);
                  const postCategories = getPostCategories(post);

                  return (
                    <article
                      key={post.id}
                      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
                    >
                      {/* 画像 */}
                      {featuredImage && (
                        <button
                          onClick={() => onSelectPost?.(post.id)}
                          className="w-full cursor-pointer"
                        >
                          <img
                            src={featuredImage}
                            alt={post.title.rendered}
                            className="w-full h-48 object-cover hover:opacity-90 transition-opacity"
                          />
                        </button>
                      )}

                      {/* コンテンツ */}
                      <div className="p-6">
                        {/* カテゴリー */}
                        {postCategories.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {postCategories.map((cat) => (
                              <span
                                key={cat.id}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded"
                              >
                                <Tag className="w-3 h-3" />
                                {cat.name}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* タイトル */}
                        <h2 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                          <button
                            onClick={() => onSelectPost?.(post.id)}
                            className="text-left hover:text-[#C1121F] transition-colors cursor-pointer w-full"
                            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                          />
                        </h2>

                        {/* 抜粋 */}
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {stripHtml(post.excerpt.rendered)}
                        </p>

                        {/* 日付 */}
                        <div className="flex items-center gap-2 text-gray-500 text-xs">
                          <Calendar className="w-4 h-4" />
                          <time dateTime={post.date}>{formatDate(post.date)}</time>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
