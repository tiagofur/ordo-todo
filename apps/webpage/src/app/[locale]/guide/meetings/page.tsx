'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Video, ClipboardPaste, Wand2, FileText, ListChecks, Scale, Users, History } from 'lucide-react';

const outputs = [
  { key: 'summary', icon: FileText, color: '#06B6D4' },
  { key: 'actions', icon: ListChecks, color: '#F97316' },
  { key: 'decisions', icon: Scale, color: '#10B981' },
  { key: 'people', icon: Users, color: '#A855F7' },
];

export default function MeetingsGuide() {
  const t = useTranslations('GuideMeetings');

  return (
    <div>
      {/* Header Badge */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-[#06B6D4]/20 flex items-center justify-center">
          <Video className="h-5 w-5 text-[#06B6D4]" />
        </div>
        <span className="text-sm font-medium text-[#06B6D4]">{t('badge')}</span>
      </div>

      <h1 className="!mt-0">{t('title')}</h1>
      <p className="lead text-xl text-muted-foreground">{t('subtitle')}</p>

      <h2>{t('how_title')}</h2>
      <p>{t('how_text')}</p>
      <div className="not-prose p-5 rounded-xl border bg-card my-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-12 w-12 rounded-xl bg-[#06B6D4] flex items-center justify-center shrink-0">
            <ClipboardPaste className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm text-muted-foreground">{t('paste_box_text')}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-[#8B5CF6] flex items-center justify-center shrink-0">
            <Wand2 className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm text-muted-foreground">{t('analyze_box_text')}</p>
        </div>
      </div>

      <h2>{t('output_title')}</h2>
      <p>{t('output_text')}</p>
      <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
        {outputs.map((o, index) => {
          const Icon = o.icon;
          return (
            <motion.div
              key={o.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-xl border bg-card"
            >
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center mb-3"
                style={{ backgroundColor: `${o.color}20` }}
              >
                <Icon className="h-5 w-5" style={{ color: o.color }} />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{t(`outputs.${o.key}.title`)}</h3>
              <p className="text-sm text-muted-foreground">{t(`outputs.${o.key}.description`)}</p>
            </motion.div>
          );
        })}
      </div>

      <h2>{t('convert_title')}</h2>
      <p>{t('convert_text')}</p>

      <h2>{t('history_title')}</h2>
      <div className="not-prose p-5 rounded-xl border bg-card my-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-[#3B82F6] flex items-center justify-center shrink-0">
            <History className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm text-muted-foreground">{t('history_box_text')}</p>
        </div>
      </div>

      {/* Tip */}
      <div className="not-prose p-6 rounded-xl bg-[#06B6D4]/10 border border-[#06B6D4]/20 mt-8">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">{t('pro_tip')}:</strong> {t('pro_tip_text')}
        </p>
      </div>
    </div>
  );
}
