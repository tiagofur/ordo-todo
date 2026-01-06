'use client';

import { useEffect, useState } from 'react';
import { BlogPost, getBlogPosts } from '@/lib/api';
import { Button } from '@ordo-todo/ui';
import { Plus, Edit, Trash2, Globe } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { format } from 'date-fns';

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const data = await getBlogPosts();
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Blog Posts</h1>
          <p className="text-muted-foreground mt-1">Manage your blog content</p>
        </div>
        <Link href="/admin/blog/new">
          <Button className="bg-[#06B6D4] text-white hover:bg-[#0891B2]">
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </Link>
      </div>

      <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="px-6 py-4 font-semibold">Title</th>
              <th className="px-6 py-4 font-semibold">Category</th>
              <th className="px-6 py-4 font-semibold">Date</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
               <tr>
                 <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                   Loading posts...
                 </td>
               </tr>
            ) : posts.length === 0 ? (
               <tr>
                 <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                   No posts found. Create one to get started.
                 </td>
               </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{post.title}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[300px]">/{post.slug}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#06B6D4]/10 text-[#06B6D4]">
                      {post.category || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {post.publishedAt ? format(new Date(post.publishedAt), 'MMM d, yyyy') : 'Draft'}
                  </td>
                  <td className="px-6 py-4">
                    {post.publishedAt ? (
                      <span className="flex items-center gap-1.5 text-green-600 text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                        Published
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-amber-600 text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/blog/${post.slug}`} target="_blank">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <Globe className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/blog/${post.slug}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
