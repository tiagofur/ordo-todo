'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { ArrowRight, BookOpen, Clock, Tag } from 'lucide-react';
import { Button } from '@ordo-todo/ui';

// Mock blog data - in production this would come from the API
const PREVIEW_POSTS = [
  {
    id: '1',
    slug: 'productivity-tips-2024',
    title: 'Top 10 Productivity Tips for 2024',
    excerpt: 'Discover the most effective strategies to boost your productivity and achieve more in less time.',
    coverImage: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=800',
    readTime: 5,
    category: 'Productivity',
    categoryColor: '#06B6D4',
  },
  {
    id: '2',
    slug: 'pomodoro-guide',
    title: 'The Complete Guide to Pomodoro Technique',
    excerpt: 'Master the art of focused work with our comprehensive Pomodoro technique guide.',
    coverImage: 'https://images.unsplash.com/photo-1501139083538-0139583c060f?auto=format&fit=crop&q=80&w=800',
    readTime: 8,
    category: 'Focus',
    categoryColor: '#EC4899',
  },
  {
    id: '3',
    slug: 'remote-work-tips',
    title: 'Staying Productive While Working Remotely',
    excerpt: 'Essential tips for maintaining high productivity when working from home.',
    coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800',
    readTime: 6,
    category: 'Remote Work',
    categoryColor: '#10B981',
  },
];

export function BlogPreview() {
  const t = useTranslations('BlogPreview');

  return (
    <section className="py-24 lg:py-32 bg-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 right-40 w-16 h-16 border-4 border-[#EC4899]/10 rotate-12" />
      <div className="absolute bottom-20 left-40 w-20 h-20 border-4 border-[#06B6D4]/10 rounded-full" />

      <div className="container relative z-10 px-4 md:px-6">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EC4899] text-white mb-6">
              <BookOpen className="h-4 w-4" />
              <span className="text-sm font-medium">{t('badge')}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              {t('title')}
            </h2>
            <p className="text-lg text-muted-foreground mt-4 max-w-xl">
              {t('subtitle')}
            </p>
          </div>
          
          <Link href="/blog">
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-[#EC4899] text-[#EC4899] hover:bg-[#EC4899] hover:text-white transition-colors group"
            >
              {t('view_all')}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PREVIEW_POSTS.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <Link href={`/blog/${post.slug}`} className="block h-full">
                <div className="h-full rounded-2xl border-2 border-border bg-card overflow-hidden hover:border-[#EC4899]/50 transition-all duration-300 hover:shadow-xl">
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img 
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Category badge */}
                    <div 
                      className="absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium text-white"
                      style={{ backgroundColor: post.categoryColor }}
                    >
                      {post.category}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-[#EC4899] transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    
                    {/* Meta */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{post.readTime} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Tag className="h-4 w-4" />
                        <span>{post.category}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
