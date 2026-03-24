import type { BlogPost } from '@/app/pages/BlogPage';

interface BlogPostsData {
  posts: Array<{
    id: number;
    title: { rendered: string };
    content: { rendered: string };
    excerpt: { rendered: string };
    date: string;
    category: string;
    featuredImage: string | null;
    slug: string;
  }>;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    // キャッシュバスターでViteのキャッシュを無効化（ローカル開発時に即反映）
    const response = await fetch(`/blog-posts.json?t=${Date.now()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch blog posts');
    }
    const data: BlogPostsData = await response.json();

    // WordPress API形式に変換（slug重複を除去してから変換）
    const uniquePosts = data.posts.filter(
      (post, index, self) => self.findIndex((p) => p.slug === post.slug) === index
    );

    return uniquePosts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      date: post.date,
      link: `/blog/${post.slug}`,
      featured_media: 0,
      _embedded: {
        'wp:featuredmedia': post.featuredImage
          ? [{ source_url: post.featuredImage }]
          : undefined,
        'wp:term': [
          [
            {
              id: 0,
              name: post.category,
              slug: post.category.toLowerCase().replace(/\s+/g, '-'),
            },
          ],
        ],
      },
    }));
  } catch (error) {
    console.error('Error loading blog posts:', error);
    return [];
  }
}

export async function getBlogPostById(id: number): Promise<BlogPost | null> {
  const posts = await getBlogPosts();
  return posts.find((post) => post.id === id) || null;
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await getBlogPosts();
  return posts.find((post) => post.link === `/blog/${slug}`) || null;
}
