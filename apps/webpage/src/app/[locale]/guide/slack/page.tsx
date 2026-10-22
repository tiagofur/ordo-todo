'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Hash, Terminal, MousePointerClick, Newspaper } from 'lucide-react';

export default function SlackGuide() {
  const t = useTranslations('GuideSlack');

  const ways = [
    { key: 'command', icon: Terminal, color: '#4A154B' },
    { key: 'action', icon: MousePointerClick, color: '#06B6D4' },
    { key: 'digest', icon: Newspaper, color: '#EC4899' },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-[#4A154B]/20 flex items-center justify-center">
          <Hash className="h-5 w-5 text-[#4A154B]" />
        </div>
        <span className="text-sm font-medium text-[#4A154B]">{t('badge')}</span>
      </div>

      <h1 className="!mt-0">{t('title')}</h1>
      <p className="lead text-xl text-muted-foreground">
        {t('subtitle')}
      </p>

      <h2>{t('ways_title')}</h2>
      <div className="not-prose space-y-4 my-6">
        {ways.map((way, index) => {
          const Icon = way.icon;
          return (
            <motion.div
              key={way.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-5 rounded-xl border bg-card"
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${way.color}20` }}
                >
                  <Icon className="h-5 w-5" style={{ color: way.color }} />
                </div>
                <h4 className="font-semibold text-foreground">{t(`ways.${way.key}.title`)}</h4>
              </div>
              <p className="text-sm text-muted-foreground">{t(`ways.${way.key}.description`)}</p>
              <p className="mt-2">
                <kbd className="px-2 py-1 rounded bg-muted text-xs font-mono">{t(`ways.${way.key}.example`)}</kbd>
              </p>
            </motion.div>
          );
        })}
      </div>

      <h2>{t('status_title')}</h2>
      <p>{t('status_text')}</p>

      <div className="not-prose p-6 rounded-xl bg-[#4A154B]/10 border border-[#4A154B]/20 mt-8">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">{t('pro_tip')}:</strong> {t('pro_tip_text')}
        </p>
      </div>
    </div>
  );
}
