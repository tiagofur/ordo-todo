'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Sparkles, Wrench, Bug, Trash2, Calendar, Loader2 } from 'lucide-react';
import { getChangelogEntries } from '@/lib/api';
import type { ChangelogEntry } from '@/lib/api';

const TYPE_CONFIG = {
  NEW: { icon: Sparkles, color: '#10B981', label: 'New' },
  IMPROVED: { icon: Wrench, color: '#06B6D4', label: 'Improved' },
  FIXED: { icon: Bug, color: '#F97316', label: 'Fixed' },
  REMOVED: { icon: Trash2, color: '#EF4444', label: 'Removed' },
};

export default function ChangelogPage() {
  const t = useTranslations('Changelog');
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadChangelog();
  }, []);

  const loadChangelog = async () => {
    setIsLoading(true);
    try {
      const data = await getChangelogEntries();
      setEntries(data);
    } catch (error) {
      console.error('Failed to load changelog:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background pt-24 pb-16">
      <div className="container px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#06B6D4] text-white mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">{t('badge')}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 text-foreground">
            {t('title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Changelog Timeline */}
        <div className="max-w-3xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#06B6D4]" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No changelog entries yet.</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[27px] top-0 bottom-0 w-0.5 bg-border" />

              {entries.map((entry, index) => {
                const typeConfig = TYPE_CONFIG[entry.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.NEW;
                const Icon = typeConfig.icon;

                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative pl-16 pb-12 last:pb-0"
                  >
                    {/* Timeline dot */}
                    <div 
                      className="absolute left-0 w-14 h-14 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: typeConfig.color }}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>

                    {/* Content card */}
                    <div className="bg-card border-2 border-border rounded-xl p-6 hover:border-[#06B6D4]/50 transition-colors">
                      {/* Header */}
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        {entry.version && (
                          <span className="px-3 py-1 rounded-full text-sm font-bold bg-muted">
                            v{entry.version}
                          </span>
                        )}
                        <span 
                          className="px-3 py-1 rounded-full text-sm font-medium text-white"
                          style={{ backgroundColor: typeConfig.color }}
                        >
                          {typeConfig.label}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-muted-foreground ml-auto">
                          <Calendar className="h-4 w-4" />
                          {new Date(entry.publishedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-xl font-bold text-foreground mb-3">
                        {entry.title}
                      </h2>

                      {/* Content */}
                      <p className="text-muted-foreground leading-relaxed">
                        {entry.content}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
