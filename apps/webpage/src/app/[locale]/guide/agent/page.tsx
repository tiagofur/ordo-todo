'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Bot, MessageCircleQuestion, Wand2, CalendarClock } from 'lucide-react';

export default function AgentGuide() {
  const t = useTranslations('GuideAgent');

  const powers = [
    { key: 'ask', icon: MessageCircleQuestion, color: '#3B82F6' },
    { key: 'actions', icon: Wand2, color: '#A855F7' },
    { key: 'jobs', icon: CalendarClock, color: '#10B981' },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center">
          <Bot className="h-5 w-5 text-[#3B82F6]" />
        </div>
        <span className="text-sm font-medium text-[#3B82F6]">{t('badge')}</span>
      </div>

      <h1 className="!mt-0">{t('title')}</h1>
      <p className="lead text-xl text-muted-foreground">
        {t('subtitle')}
      </p>

      <h2>{t('powers_title')}</h2>
      <div className="not-prose space-y-4 my-6">
        {powers.map((power, index) => {
          const Icon = power.icon;
          return (
            <motion.div
              key={power.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-5 rounded-xl border bg-card"
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${power.color}20` }}
                >
                  <Icon className="h-5 w-5" style={{ color: power.color }} />
                </div>
                <h4 className="font-semibold text-foreground">{t(`powers.${power.key}.title`)}</h4>
              </div>
              <p className="text-sm text-muted-foreground">{t(`powers.${power.key}.description`)}</p>
              <p className="mt-2">
                <kbd className="px-2 py-1 rounded bg-muted text-xs font-mono">{t(`powers.${power.key}.example`)}</kbd>
              </p>
            </motion.div>
          );
        })}
      </div>

      <h2>{t('safety_title')}</h2>
      <p>{t('safety_text')}</p>

      <div className="not-prose p-6 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 mt-8">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">{t('pro_tip')}:</strong> {t('pro_tip_text')}
        </p>
      </div>
    </div>
  );
}
