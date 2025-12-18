import Link from 'next/link';
import { formatDate } from '@/lib/utils'; // I need to create utils or use date-fns
import { BlogPost } from '@/lib/api';
import { Card, CardContent, CardFooter, CardHeader } from "@ordo-todo/ui"; 
// Assuming shared UI card availability, if not I'll implement basic markup.
// UI package exports: Card, etc? Let's check or just use standard HTML/Tailwind for speed/safety.

export function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <div className="flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden transition-all hover:shadow-md">
      {post.coverImage && (
        <div className="aspect-video w-full overflow-hidden">
          <img 
            src={post.coverImage} 
            alt={post.title} 
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
        </div>
      )}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-2xl font-semibold leading-none tracking-tight mb-2">
          <Link href={`/blog/${post.slug}`} className="hover:underline">
            {post.title}
          </Link>
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {new Date(post.publishedAt).toLocaleDateString()} • {post.author || 'Ordo Team'}
        </p>
        <p className="text-muted-foreground flex-1">
          {post.excerpt}
        </p>
      </div>
    </div>
  );
}
