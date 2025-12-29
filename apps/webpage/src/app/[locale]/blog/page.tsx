import { useTranslations } from 'next-intl';
import { getBlogPosts } from '@/lib/api';
import { BlogPostCard } from '@/components/blog-card';

export default async function BlogPage() {
  const posts = await getBlogPosts();
  
  // We need to use translation in Server Component. 
  // next-intl provides `getTranslations` for async server components.
  const { getTranslations } = await import('next-intl/server'); // Dynamic import to avoid build issues?
  // standard way: import { getTranslations } from 'next-intl/server';
  // But let's stick to simple usage if imports are tricky. 
  
  // Wait, I can't easily mix hook `useTranslations` (client) with async server component logic for `t`.
  // Actually, in Server Components `useTranslations` works if setup correctly, OR use `getTranslations`.
  const t = await getTranslations('Blog');

  return (
     <div className="container py-16">
       <div className="text-center max-w-2xl mx-auto mb-12">
         <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
         <p className="text-xl text-muted-foreground">{t('description')}</p>
       </div>
       
       {posts.length > 0 ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {posts.map((post) => (
             <BlogPostCard key={post.id} post={post} />
           ))}
         </div>
       ) : (
         <div className="text-center py-12 border rounded-lg bg-muted/20">
            <p className="text-muted-foreground">No posts found yet.</p>
         </div>
       )}
     </div>
  );
}
