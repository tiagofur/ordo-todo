'use client';

import { useEffect, useState, use } from 'react';
import BlogEditor from '../editor';
import { getBlogPost, BlogPost } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: slug } = use(params); // We changed route to use slug, but param name in file system [id] corresponds to `id`. Even if we pass a slug, Next.js calls it `id`.
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const data = await getBlogPost(slug);
        setPost(data);
      } catch (error) {
        console.error('Failed to load post', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadPost();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold">Post not found</h2>
      </div>
    );
  }

  return <BlogEditor initialData={post} isEditing={true} />;
}
