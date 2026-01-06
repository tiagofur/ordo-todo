
import { notFound } from 'next/navigation';
import { getBlogPost } from '@/lib/api';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="container py-16 max-w-3xl mx-auto">
      <Link href="/blog" className="inline-flex items-center text-sm mb-8 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Blog
      </Link>
      
      {post.coverImage && (
        <div className="aspect-video w-full overflow-hidden rounded-xl mb-8">
           <Image 
             src={post.coverImage} 
             alt={post.title} 
             fill
             className="object-cover"
           />
        </div>
      )}
      
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
        {post.title}
      </h1>
      
      <div className="flex items-center text-muted-foreground mb-8 text-sm">
         <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
         <span className="mx-2">•</span>
         <span>{post.author || 'Ordo Team'}</span>
      </div>
      
      <div className="prose dark:prose-invert max-w-none">
         {post.content}
      </div>
    </article>
  );
}
