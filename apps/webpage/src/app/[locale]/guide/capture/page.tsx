'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Zap, Keyboard, MessageSquareText, Smartphone } from 'lucide-react';

export default function CaptureGuide() {
  const t = useTranslations('GuideCapture');

  const methods = [
    { key: 'quickadd', icon: Zap, color: '#3B82F6' },
    { key: 'palette', icon: Keyboard, color: '#06B6D4' },
    { key: 'mobile', icon: Smartphone, color: '#EC4899' },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center">
          <Zap className="h-5 w-5 text-[#3B82F6]" />
        </div>
        <span className="text-sm font-medium text-[#3B82F6]">{t('badge')}</span>
      </div>

      <h1 className="!mt-0">{t('title')}</h1>
      <p className="lead text-xl text-muted-foreground">
        {t('subtitle')}
      </p>

      <h2>{t('nl_title')}</h2>
      <p>{t('nl_text')}</p>
      <div className="not-prose p-5 rounded-xl border bg-card my-6">
        <div className="flex items-start gap-4">
          <MessageSquareText className="h-6 w-6 text-[#3B82F6] shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="font-mono text-sm text-foreground">{t('nl_example')}</p>
            <p className="text-sm text-muted-foreground">{t('nl_result')}</p>
          </div>
        </div>
      </div>

      <h2>{t('methods_title')}</h2>
      <div className="not-prose grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
        {methods.map((method, index) => {
          const Icon = method.icon;
          return (
            <motion.div
              key={method.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-5 rounded-xl border bg-card text-center"
            >
              <div
                className="h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ backgroundColor: `${method.color}20` }}
              >
                <Icon className="h-6 w-6" style={{ color: method.color }} />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{t(`methods.${method.key}.title`)}</h3>
              <p className="text-sm text-muted-foreground">{t(`methods.${method.key}.description`)}</p>
              <p className="mt-2">
                <kbd className="px-2 py-1 rounded bg-muted text-xs font-mono">{t(`methods.${method.key}.shortcut`)}</kbd>
              </p>
            </motion.div>
          );
        })}
      </div>

      <h2>{t('palette_title')}</h2>
      <p>{t('palette_text')}</p>

      <div className="not-prose p-6 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 mt-8">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">{t('pro_tip')}:</strong> {t('pro_tip_text')}
        </p>
      </div>
    </div>
  );
}
