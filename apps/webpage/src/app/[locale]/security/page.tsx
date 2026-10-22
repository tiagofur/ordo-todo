'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { KeyRound, Database, Brain, CreditCard, CalendarClock } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function SecurityPage() {
  const t = useTranslations('Security');

  const sections = [
    { key: 'auth', icon: KeyRound },
    { key: 'data', icon: Database },
    { key: 'ai', icon: Brain },
    { key: 'billing', icon: CreditCard },
    { key: 'planned', icon: CalendarClock },
  ];

  return (
    <main className="min-h-screen bg-background pt-24 pb-16">
      <div className="container px-4 md:px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold tracking-tight mb-4 text-foreground">
            {t('title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 mb-8"
        >
          <h3 className="font-bold text-foreground mb-2">{t('note_title')}</h3>
          <p className="text-sm text-muted-foreground">{t('note_text')}</p>
        </motion.div>

        <div className="prose prose-lg dark:prose-invert max-w-none">
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
          <p>{t('contact_text')} <Link href="/contact" className="text-primary hover:underline">{t('contact_link')}</Link>.</p>
        </div>
      </div>
    </main>
  );
}
