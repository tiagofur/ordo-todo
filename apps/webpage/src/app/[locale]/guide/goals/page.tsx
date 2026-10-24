'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Target, Plus, Link2, TrendingUp } from 'lucide-react';

const krTypes = [
  { key: 'percent', color: '#06B6D4' },
  { key: 'number', color: '#3B82F6' },
  { key: 'currency', color: '#10B981' },
  { key: 'boolean', color: '#A855F7' },
  { key: 'tasks', color: '#F97316' },
];

export default function GoalsGuide() {
  const t = useTranslations('GuideGoals');

  return (
    <div>
      {/* Header Badge */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-[#F97316]/20 flex items-center justify-center">
          <Target className="h-5 w-5 text-[#F97316]" />
        </div>
        <span className="text-sm font-medium text-[#F97316]">{t('badge')}</span>
      </div>

      <h1 className="!mt-0">{t('title')}</h1>
      <p className="lead text-xl text-muted-foreground">{t('subtitle')}</p>

      <h2>{t('okr_title')}</h2>
      <p>{t('okr_text')}</p>

      <h3>{t('create_title')}</h3>
      <div className="not-prose p-5 rounded-xl border bg-card my-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-[#F97316] flex items-center justify-center shrink-0">
            <Plus className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm text-muted-foreground">{t('create_box_text')}</p>
        </div>
      </div>

      <h2>{t('kr_title')}</h2>
      <p>{t('kr_text')}</p>
      <div className="not-prose grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-6">
        {krTypes.map((type, index) => (
          <motion.div
            key={type.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 rounded-xl border bg-card"
          >
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center mb-3"
              style={{ backgroundColor: `${type.color}20` }}
            >
              <TrendingUp className="h-5 w-5" style={{ color: type.color }} />
            </div>
            <h3 className="font-semibold text-foreground mb-1">{t(`kr_types.${type.key}.title`)}</h3>
            <p className="text-sm text-muted-foreground">{t(`kr_types.${type.key}.description`)}</p>
          </motion.div>
        ))}
      </div>

      <h2>{t('link_title')}</h2>
      <p>{t('link_text')}</p>
      <div className="not-prose p-5 rounded-xl border bg-card my-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-[#3B82F6] flex items-center justify-center shrink-0">
            <Link2 className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm text-muted-foreground">{t('link_box_text')}</p>
        </div>
      </div>

      <h2>{t('review_title')}</h2>
      <p>{t('review_text')}</p>

      {/* Tip */}
      <div className="not-prose p-6 rounded-xl bg-[#F97316]/10 border border-[#F97316]/20 mt-8">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">{t('pro_tip')}:</strong> {t('pro_tip_text')}
        </p>
      </div>
    </div>
  );
}
