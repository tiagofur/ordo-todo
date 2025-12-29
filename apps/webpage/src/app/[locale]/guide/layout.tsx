'use client';

import { useTranslations } from 'next-intl';
import { GuideSidebar } from '@/components/guide-sidebar';
import { motion } from 'framer-motion';

export default function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('Guide');

  return (
    <div className="min-h-screen pt-16">
      {/* Header Banner */}
      <div className="bg-[#06B6D4]/10 border-b">
        <div className="container px-4 md:px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold mb-2">{t('header.title')}</h1>
            <p className="text-muted-foreground">{t('header.subtitle')}</p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container px-4 md:px-6 py-12">
        <div className="flex gap-12">
          <GuideSidebar />
          <main className="flex-1 min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="prose prose-lg dark:prose-invert max-w-none
                prose-headings:font-bold
                prose-h1:text-3xl prose-h1:mb-6
                prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:border-b prose-h2:pb-2
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-muted-foreground prose-p:leading-relaxed
                prose-li:text-muted-foreground
                prose-strong:text-foreground
                prose-img:rounded-xl prose-img:shadow-xl prose-img:border
              "
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}
