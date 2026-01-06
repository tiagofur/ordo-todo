'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { ArrowRight, BookOpen, Clock, Tag } from 'lucide-react';
import { Button } from '@ordo-todo/ui';
import Image from 'next/image';

// Mock blog data - in production this would come from the API
// Mock removed, using real data
import { getBlogPosts, BlogPost } from '@/lib/api';
import { useEffect, useState } from 'react';
import { Skeleton } from '@ordo-todo/ui';

export function BlogPreview() {
  const t = useTranslations('BlogPreview');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await getBlogPosts();
        // Take latest 3
        setPosts(data.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadPosts();
  }, []);

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
          {isLoading ? (
            // Skeletons
            [1, 2, 3].map(i => (
              <div key={i} className="h-[400px] rounded-2xl bg-muted animate-pulse" />
            ))
          ) : posts.length > 0 ? (
            posts.map((post, index) => (
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
                    <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                      {post.coverImage ? (
                        <Image 
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <span className="text-4xl">📝</span>
                        </div>
                      )}
                      
                      {/* Category badge */}
                      {post.category && (
                        <div 
                          className="absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium text-white bg-[#06B6D4]"
                        >
                          {post.category}
                        </div>
                      )}
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
                        {post.readTime && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{post.readTime} min</span>
                          </div>
                        )}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Tag className="h-4 w-4" />
                            <span>{post.tags[0]}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))
          ) : (
            <div className="col-span-3 text-center py-12 text-muted-foreground">
              {t('no_posts', { defaultMessage: 'Coming soon...' })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
