'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { StickyNote, LayoutGrid, Palette, Save, Search } from 'lucide-react';

const modes = [
  { key: 'wall', icon: LayoutGrid, color: '#06B6D4' },
  { key: 'board', icon: StickyNote, color: '#EAB308' },
];

const perks = [
  { key: 'colors', icon: Palette, color: '#EC4899' },
  { key: 'autosave', icon: Save, color: '#10B981' },
  { key: 'search', icon: Search, color: '#3B82F6' },
];

export default function NotesGuide() {
  const t = useTranslations('GuideNotes');

  return (
    <div>
      {/* Header Badge */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-[#EAB308]/20 flex items-center justify-center">
          <StickyNote className="h-5 w-5 text-[#EAB308]" />
        </div>
        <span className="text-sm font-medium text-[#EAB308]">{t('badge')}</span>
      </div>

      <h1 className="!mt-0">{t('title')}</h1>
      <p className="lead text-xl text-muted-foreground">{t('subtitle')}</p>

      <h2>{t('what_title')}</h2>
      <p>{t('what_text')}</p>

      <h2>{t('modes_title')}</h2>
      <p>{t('modes_text')}</p>
      <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
        {modes.map((mode, index) => {
          const Icon = mode.icon;
          return (
            <motion.div
              key={mode.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-xl border bg-card"
            >
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center mb-3"
                style={{ backgroundColor: `${mode.color}20` }}
              >
                <Icon className="h-5 w-5" style={{ color: mode.color }} />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{t(`modes.${mode.key}.title`)}</h3>
              <p className="text-sm text-muted-foreground">{t(`modes.${mode.key}.description`)}</p>
            </motion.div>
          );
        })}
      </div>

      <h2>{t('perks_title')}</h2>
      <p>{t('perks_text')}</p>
      <div className="not-prose grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
        {perks.map((perk, index) => {
          const Icon = perk.icon;
          return (
            <motion.div
              key={perk.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-xl border bg-card"
            >
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center mb-3"
                style={{ backgroundColor: `${perk.color}20` }}
              >
                <Icon className="h-5 w-5" style={{ color: perk.color }} />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{t(`perks.${perk.key}.title`)}</h3>
              <p className="text-sm text-muted-foreground">{t(`perks.${perk.key}.description`)}</p>
            </motion.div>
          );
        })}
      </div>

      <h2>{t('from_idea_title')}</h2>
      <p>{t('from_idea_text')}</p>

      {/* Tip */}
      <div className="not-prose p-6 rounded-xl bg-[#EAB308]/10 border border-[#EAB308]/20 mt-8">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">{t('pro_tip')}:</strong> {t('pro_tip_text')}
        </p>
      </div>
    </div>
  );
}
