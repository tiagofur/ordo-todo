'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Layout, Columns3, List, Tags, Users } from 'lucide-react';

export default function ProjectsGuide() {
  const t = useTranslations('GuideProjects');

  const viewTypes = [
    { key: 'kanban', icon: Columns3, color: '#EC4899' },
    { key: 'list', icon: List, color: '#06B6D4' },
  ];

  const features = [
    { key: 'tags', icon: Tags, color: '#F97316' },
    { key: 'team', icon: Users, color: '#A855F7' },
  ];

  return (
    <div>
      {/* Header Badge */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-[#EC4899]/20 flex items-center justify-center">
          <Layout className="h-5 w-5 text-[#EC4899]" />
        </div>
        <span className="text-sm font-medium text-[#EC4899]">{t('badge')}</span>
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
          src="/images/guide/projects.png" 
          alt="Kanban Board" 
          width={1200}
          height={675}
          className="w-full rounded-xl border shadow-2xl"
        />
      </motion.div>

      <h2>{t('managing_title')}</h2>
      <p>{t('managing_text')}</p>

      <h3>{t('creating_title')}</h3>
      <ol>
        <li>{t('creating_steps.1')}</li>
        <li>{t('creating_steps.2')}</li>
        <li>{t('creating_steps.3')}</li>
        <li>{t('creating_steps.4')}</li>
      </ol>

      <h2>{t('views_title')}</h2>
      <p>{t('views_text')}</p>

      <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
        {viewTypes.map((view, index) => {
          const Icon = view.icon;
          return (
            <motion.div
              key={view.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-5 rounded-xl border bg-card"
            >
              <div 
                className="h-10 w-10 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: `${view.color}20` }}
              >
                <Icon className="h-5 w-5" style={{ color: view.color }} />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{t(`views.${view.key}.title`)}</h3>
              <p className="text-sm text-muted-foreground">{t(`views.${view.key}.description`)}</p>
            </motion.div>
          );
        })}
      </div>

      <h2>{t('advanced_title')}</h2>
      <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="p-5 rounded-xl border bg-card"
            >
              <div 
                className="h-10 w-10 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: `${feature.color}20` }}
              >
                <Icon className="h-5 w-5" style={{ color: feature.color }} />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{t(`features.${feature.key}.title`)}</h3>
              <p className="text-sm text-muted-foreground">{t(`features.${feature.key}.description`)}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Tip Box */}
      <div className="not-prose p-6 rounded-xl bg-[#EC4899]/10 border border-[#EC4899]/20 mt-8">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">{t('pro_tip')}:</strong> {t('pro_tip_text')}
          <kbd className="mx-2 px-2 py-1 rounded bg-muted text-xs font-mono">{t('pro_tip_shortcut')}</kbd> 
          {t('pro_tip_end')}
        </p>
      </div>
    </div>
  );
}
