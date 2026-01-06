'use client';

import { useState } from 'react';
import { Button } from '@ordo-todo/ui';
import { useRouter } from '@/i18n/routing';
import { Loader2, Sparkles, Save, ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/routing';

interface EditorProps {
  initialData?: any;
  isEditing?: boolean;
}

export default function BlogEditor({ initialData, isEditing = false }: EditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    excerpt: initialData?.excerpt || '',
    content: initialData?.content || '',
    category: initialData?.category || '',
    tags: initialData?.tags?.join(', ') || '',
    readTime: initialData?.readTime || 5,
    published: initialData?.published || false,
  });

  const generateWithAI = async () => {
    if (!formData.title && !formData.category) {
      alert('Please enter at least a Title or Category to guide the AI');
      return;
    }

    setGenerating(true);
    try {
      // We'll use the title as the topic
      const token = localStorage.getItem('ordo_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3101/api/v1'}/blog/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ topic: formData.title || formData.category }),
      });

      if (!res.ok) throw new Error('Failed to generate content');

      const data = await res.json();
      setFormData(prev => ({
        ...prev,
        title: data.title || prev.title,
        slug: data.slug || prev.slug,
        excerpt: data.excerpt || prev.excerpt,
        content: data.content || prev.content,
        category: data.category || prev.category,
        tags: data.tags?.join(', ') || prev.tags,
        readTime: data.readTime || prev.readTime,
      }));
    } catch (error) {
      console.error('AI Generation failed:', error);
      alert('Failed to generate content. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('ordo_token');
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
        readTime: Number(formData.readTime),
      };

      const url = isEditing 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3101/api/v1'}/blog/${initialData.id}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3101/api/v1'}/blog`;

      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save post');

      router.push('/admin/blog');
      router.refresh();
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/blog">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{isEditing ? 'Edit Post' : 'New Blog Post'}</h1>
            <p className="text-muted-foreground mt-1">Create impactful content using AI</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={generateWithAI}
            disabled={generating}
            className="border-[#EC4899] text-[#EC4899] hover:bg-[#EC4899] hover:text-white"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Thinking...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate with AI
              </>
            )}
          </Button>
          <Button type="submit" disabled={loading} className="bg-[#06B6D4] text-white hover:bg-[#0891B2]">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Post
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Enter post title..."
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Content (Markdown)</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="flex min-h-[500px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
              placeholder="# Write your masterpiece..."
              required
            />
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <div className="p-6 rounded-xl border bg-card/50 space-y-6">
            <h3 className="font-semibold">Settings</h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="url-friendly-slug"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Technology, Productivity..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tags (comma separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="AI, coding, future"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Excerpt</label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                placeholder="Brief summary for preview cards..."
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <label className="text-sm font-medium">Published</label>
              <input 
                type="checkbox" 
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="h-5 w-5 rounded border-gray-300"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
