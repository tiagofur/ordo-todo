'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Plug, MousePointerClick, Terminal, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function ConnectGuide() {
  const t = useTranslations('GuideConnect');

  const clientCards = [
    { key: 'chatgpt', href: '/guide/connect/chatgpt', color: '#10B981' },
    { key: 'claude', href: '/guide/connect/claude', color: '#F97316' },
    { key: 'hermes', href: '/guide/connect/hermes', color: '#06B6D4' },
    { key: 'openclaw', href: '/guide/connect/openclaw', color: '#A855F7' },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-[#06B6D4]/20 flex items-center justify-center">
          <Plug className="h-5 w-5 text-[#06B6D4]" />
        </div>
        <span className="text-sm font-medium text-[#06B6D4]">{t('badge')}</span>
      </div>

      <h1 className="!mt-0">{t('title')}</h1>
      <p className="lead text-xl text-muted-foreground">{t('subtitle')}</p>

      <h2>{t('how_title')}</h2>
      <p>{t('how_text')}</p>

      <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
        <div className="p-5 rounded-xl border bg-card">
          <div className="flex items-center gap-3 mb-2">
            <MousePointerClick className="h-5 w-5 text-[#10B981]" />
            <h4 className="font-semibold text-foreground">{t('oneclick_title')}</h4>
          </div>
          <p className="text-sm text-muted-foreground">{t('oneclick_text')}</p>
        </div>
        <div className="p-5 rounded-xl border bg-card">
          <div className="flex items-center gap-3 mb-2">
            <Terminal className="h-5 w-5 text-[#F97316]" />
            <h4 className="font-semibold text-foreground">{t('manual_title')}</h4>
          </div>
          <p className="text-sm text-muted-foreground">{t('manual_text')}</p>
        </div>
      </div>

      <h2>{t('clients_title')}</h2>
      <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
        {clientCards.map((card, index) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <Link
              href={card.href}
              className="flex items-center gap-4 p-5 rounded-xl border bg-card hover:shadow-lg transition-all duration-300 group"
            >
              <div
                className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${card.color}20` }}
              >
                <CheckCircle2 className="h-6 w-6" style={{ color: card.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground">
                  {t(`clients.${card.key}.title`)}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {t(`clients.${card.key}.description`)}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        ))}
      </div>

      <h2>{t('more_title')}</h2>
      <div className="not-prose space-y-4 my-6">
        <Link
          href="/guide/connect/slack"
          className="flex gap-4 p-4 rounded-xl border bg-card hover:shadow-lg transition-all duration-300 group"
        >
          <div className="flex-1">
            <h4 className="font-semibold text-foreground">{t('slack_title')}</h4>
            <p className="text-sm text-muted-foreground">{t('slack_text')}</p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform shrink-0 mt-1" />
        </Link>
        <Link
          href="/guide/connect/zapier"
          className="flex gap-4 p-4 rounded-xl border bg-card hover:shadow-lg transition-all duration-300 group"
        >
          <div className="flex-1">
            <h4 className="font-semibold text-foreground">{t('zapier_title')}</h4>
            <p className="text-sm text-muted-foreground">{t('zapier_text')}</p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform shrink-0 mt-1" />
        </Link>
      </div>
    </div>
  );
}
