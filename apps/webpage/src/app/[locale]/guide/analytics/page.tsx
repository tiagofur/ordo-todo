'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Clock, Target, Flame, Calendar } from 'lucide-react';

export default function AnalyticsGuide() {
  const t = useTranslations('GuideAnalytics');

  const metrics = [
    { key: 'focus', icon: Clock, color: '#06B6D4' },
    { key: 'tasks', icon: Target, color: '#10B981' },
    { key: 'score', icon: TrendingUp, color: '#EC4899' },
    { key: 'streak', icon: Flame, color: '#F97316' },
  ];

  const reportKeys = ['daily', 'weekly', 'monthly', 'custom'];

  return (
    <div>
      {/* Header Badge */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-[#A855F7]/20 flex items-center justify-center">
          <BarChart3 className="h-5 w-5 text-[#A855F7]" />
        </div>
        <span className="text-sm font-medium text-[#A855F7]">{t('badge')}</span>
      </div>

      <h1 className="!mt-0">{t('title')}</h1>
      <p className="lead text-xl text-muted-foreground">
        {t('subtitle')}
      </p>

      {/* Hero Image */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="my-8 rounded-2xl overflow-hidden"
      >
        <Image 
          src="/images/guide/analytics.png" 
          alt="Analytics Dashboard" 
          width={1200}
          height={675}
          className="w-full rounded-xl border shadow-2xl"
        />
      </motion.div>

      <h2>{t('metrics_title')}</h2>
      <p>{t('metrics_text')}</p>

      <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-5 rounded-xl border bg-card"
            >
              <div className="flex items-start justify-between mb-4">
                <div 
                  className="h-10 w-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${metric.color}20` }}
                >
                  <Icon className="h-5 w-5" style={{ color: metric.color }} />
                </div>
                <span 
                  className="text-lg font-bold"
                  style={{ color: metric.color }}
                >
                  {t(`metrics.${metric.key}.example`)}
                </span>
              </div>
              <h3 className="font-semibold text-foreground mb-1">{t(`metrics.${metric.key}.title`)}</h3>
              <p className="text-sm text-muted-foreground">{t(`metrics.${metric.key}.description`)}</p>
            </motion.div>
          );
        })}
      </div>

      <h2>{t('reports_title')}</h2>
      <p>{t('reports_text')}</p>

      <div className="not-prose space-y-3 my-6">
        {reportKeys.map((report, index) => (
          <motion.div
            key={report}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-4 p-4 rounded-xl border bg-card"
          >
            <div className="h-10 w-10 rounded-lg bg-[#A855F7]/20 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-[#A855F7]" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{t(`reports.${report}.title`)}</h3>
              <p className="text-sm text-muted-foreground">{t(`reports.${report}.description`)}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <h2>{t('understanding_title')}</h2>
      <ul>
        <li><strong>{t('understanding.peak').split(':')[0]}:</strong> {t('understanding.peak').split(':')[1]}</li>
        <li><strong>{t('understanding.velocity').split(':')[0]}:</strong> {t('understanding.velocity').split(':')[1]}</li>
        <li><strong>{t('understanding.ratio').split(':')[0]}:</strong> {t('understanding.ratio').split(':')[1]}</li>
        <li><strong>{t('understanding.goals').split(':')[0]}:</strong> {t('understanding.goals').split(':')[1]}</li>
      </ul>

      {/* Tip */}
      <div className="not-prose p-6 rounded-xl bg-[#A855F7]/10 border border-[#A855F7]/20 mt-8">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">{t('pro_tip')}:</strong> {t('pro_tip_text')}
        </p>
      </div>
    </div>
  );
}
