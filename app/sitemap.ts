import { MetadataRoute } from 'next';
import { createClient } from '@/utils/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://pinyaofthedead.com';

  // Static routes
  const routes = [
    '',
    '/news',
    '/leaderboards',
    '/donate',
    '/search',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Fetch dynamic news posts
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from('posts')
    .select('id, created_at');

  const postRoutes = (posts || []).map((post) => ({
    url: `${baseUrl}/news/${post.id}`,
    lastModified: new Date(post.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...routes, ...postRoutes];
}
