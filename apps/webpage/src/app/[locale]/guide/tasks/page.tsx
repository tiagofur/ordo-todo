'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { CheckSquare, Plus, Calendar, Flag, Clock, Paperclip, MessageSquare, GitBranch } from 'lucide-react';

export default function TasksGuide() {
  const t = useTranslations('GuideTasks');

  const taskFeatures = [
    { key: 'subtasks', icon: GitBranch, color: '#06B6D4' },
    { key: 'due_dates', icon: Calendar, color: '#EC4899' },
    { key: 'priorities', icon: Flag, color: '#F97316' },
    { key: 'time', icon: Clock, color: '#10B981' },
    { key: 'attachments', icon: Paperclip, color: '#A855F7' },
    { key: 'comments', icon: MessageSquare, color: '#3B82F6' },
  ];

  const priorityColors = ['#3B82F6', '#F59E0B', '#F97316', '#EF4444'];
  const priorityKeys = ['low', 'medium', 'high', 'urgent'];

  return (
    <div>
      {/* Header Badge */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-[#F97316]/20 flex items-center justify-center">
          <CheckSquare className="h-5 w-5 text-[#F97316]" />
        </div>
        <span className="text-sm font-medium text-[#F97316]">{t('badge')}</span>
      </div>

      <h1 className="!mt-0">{t('title')}</h1>
      <p className="lead text-xl text-muted-foreground">
        {t('subtitle')}
      </p>

      <h2>{t('basics_title')}</h2>
      <p>{t('basics_text')}</p>

      <h3>{t('creating_title')}</h3>
      <div className="not-prose p-5 rounded-xl border bg-card my-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-12 w-12 rounded-xl bg-[#F97316] flex items-center justify-center">
            <Plus className="h-6 w-6 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{t('quick_add')}</h4>
            <p className="text-sm text-muted-foreground">
              {t('quick_add_text')} <kbd className="px-2 py-0.5 rounded bg-muted text-xs font-mono">{t('quick_add_shortcut')}</kbd> {t('quick_add_end')}
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{t('or_click')}</p>
      </div>

      <h2>{t('features_title')}</h2>
      <p>{t('features_text')}</p>

      <div className="not-prose grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-6">
        {taskFeatures.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-xl border bg-card"
            >
              <div 
                className="h-10 w-10 rounded-lg flex items-center justify-center mb-3"
                style={{ backgroundColor: `${feature.color}20` }}
              >
                <Icon className="h-5 w-5" style={{ color: feature.color }} />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{t(`features.${feature.key}.title`)}</h3>
              <p className="text-sm text-muted-foreground">{t(`features.${feature.key}.description`)}</p>
            </motion.div>
          );
        })}
      </div>

      <h2>{t('statuses_title')}</h2>
      <p>{t('statuses_text')}</p>
      <div className="not-prose flex flex-wrap gap-3 my-6">
        <span className="px-4 py-2 rounded-full text-sm font-medium bg-muted text-muted-foreground">{t('statuses.todo')}</span>
        <span className="px-4 py-2 rounded-full text-sm font-medium bg-[#3B82F6]/20 text-[#3B82F6]">{t('statuses.in_progress')}</span>
        <span className="px-4 py-2 rounded-full text-sm font-medium bg-[#10B981]/20 text-[#10B981]">{t('statuses.completed')}</span>
        <span className="px-4 py-2 rounded-full text-sm font-medium bg-muted text-muted-foreground line-through">{t('statuses.cancelled')}</span>
      </div>

      <h2>{t('priority_title')}</h2>
      <p>{t('priority_text')}</p>
      <div className="not-prose space-y-3 my-6">
        {priorityKeys.map((priority, index) => (
          <div key={priority} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: priorityColors[index] }}></span>
            <span className="font-medium text-foreground">{t(`priorities.${priority}.label`)}</span>
            <span className="text-sm text-muted-foreground">- {t(`priorities.${priority}.description`)}</span>
          </div>
        ))}
      </div>

      {/* Tip */}
      <div className="not-prose p-6 rounded-xl bg-[#F97316]/10 border border-[#F97316]/20 mt-8">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">{t('pro_tip')}:</strong> {t('pro_tip_text')}
        </p>
      </div>
    </div>
  );
}
