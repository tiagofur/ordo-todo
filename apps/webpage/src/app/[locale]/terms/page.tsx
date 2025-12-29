'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Scale, FileText, AlertCircle, HelpCircle } from 'lucide-react';

export default function TermsPage() {
  const t = useTranslations('Terms');

  const sections = [
    { key: 'acceptance', icon: FileText },
    { key: 'usage', icon: Scale },
    { key: 'disclaimer', icon: AlertCircle },
    { key: 'changes', icon: HelpCircle },
  ];

  return (
    <main className="min-h-screen bg-background pt-24 pb-16">
      <div className="container px-4 md:px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold tracking-tight mb-4 text-foreground">
            {t('title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('last_updated')}: {new Date().toLocaleDateString()}
          </p>
        </motion.div>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="lead">{t('intro')}</p>

          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="my-8 p-6 rounded-2xl bg-card border"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <Icon className="h-5 w-5 text-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold m-0">{t(`sections.${section.key}.title`)}</h2>
                </div>
                <p className="text-muted-foreground m-0">
                  {t(`sections.${section.key}.content`)}
                </p>
              </motion.div>
            );
          })}

          <h3>{t('contact_title')}</h3>
          <p>{t('contact_text')} <a href="/contact" className="text-primary hover:underline">contact us</a>.</p>
        </div>
      </div>
    </main>
  );
}
