'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Hourglass, Play, Pause, History } from 'lucide-react';

export default function PomodoroGuide() {
  const t = useTranslations('GuidePomodoro');

  const controls = [
    { key: 'start', icon: Play, color: '#EF4444' },
    { key: 'pause', icon: Pause, color: '#F59E0B' },
    { key: 'history', icon: History, color: '#06B6D4' },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-[#EF4444]/20 flex items-center justify-center">
          <Hourglass className="h-5 w-5 text-[#EF4444]" />
        </div>
        <span className="text-sm font-medium text-[#EF4444]">{t('badge')}</span>
      </div>

      <h1 className="!mt-0">{t('title')}</h1>
      <p className="lead text-xl text-muted-foreground">
        {t('subtitle')}
      </p>

      <h2>{t('modes_title')}</h2>
      <p>{t('modes_text')}</p>

      <div className="not-prose grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
        {controls.map((control, index) => {
          const Icon = control.icon;
          return (
            <motion.div
              key={control.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-5 rounded-xl border bg-card text-center"
            >
              <div
                className="h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ backgroundColor: `${control.color}20` }}
              >
                <Icon className="h-6 w-6" style={{ color: control.color }} />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{t(`controls.${control.key}.title`)}</h3>
              <p className="text-sm text-muted-foreground">{t(`controls.${control.key}.description`)}</p>
            </motion.div>
          );
        })}
      </div>

      <h2>{t('task_title')}</h2>
      <p>{t('task_text')}</p>

      <h2>{t('platforms_title')}</h2>
      <p>{t('platforms_text')}</p>

      <div className="not-prose p-6 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 mt-8">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">{t('pro_tip')}:</strong> {t('pro_tip_text')}
        </p>
      </div>
    </div>
  );
}
