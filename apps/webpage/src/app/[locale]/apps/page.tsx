'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { Globe, Monitor, Smartphone, Check, Minus, X } from 'lucide-react';

const PLATFORMS = [
  { key: 'web', icon: Globe, color: '#06B6D4' },
  { key: 'desktop', icon: Monitor, color: '#EC4899' },
  { key: 'mobile', icon: Smartphone, color: '#F97316' },
];

const PARITY_ROWS = [
  'tasks',
  'capture',
  'calendar',
  'pomodoro',
  'ritual',
  'plan',
  'habits',
  'focus',
  'offline',
] as const;

type ParityValue = 'yes' | 'partial' | 'no';

const PARITY: Record<(typeof PARITY_ROWS)[number], [ParityValue, ParityValue, ParityValue]> = {
  tasks: ['yes', 'yes', 'yes'],
  capture: ['yes', 'yes', 'partial'],
  calendar: ['yes', 'yes', 'yes'],
  pomodoro: ['yes', 'yes', 'yes'],
  ritual: ['yes', 'partial', 'yes'],
  plan: ['yes', 'no', 'no'],
  habits: ['yes', 'yes', 'yes'],
  focus: ['yes', 'yes', 'yes'],
  offline: ['partial', 'yes', 'partial'],
};

function ParityCell({ value }: { value: ParityValue }) {
  if (value === 'yes')
    return (
      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-[#10B981]/15">
        <Check className="h-4 w-4 text-[#10B981]" />
      </span>
    );
  if (value === 'partial')
    return (
      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-[#F97316]/15">
        <Minus className="h-4 w-4 text-[#F97316]" />
      </span>
    );
  return (
    <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-muted">
      <X className="h-4 w-4 text-muted-foreground" />
    </span>
  );
}

export default function AppsPage() {
  const t = useTranslations('AppsPage');

  return (
    <main className="min-h-screen bg-background pt-24 pb-16">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#06B6D4] text-white mb-6">
            <Smartphone className="h-4 w-4" />
            <span className="text-sm font-medium">{t('badge')}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 text-foreground">
            {t('title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Platforms */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-20">
          {PLATFORMS.map((platform, index) => {
            const Icon = platform.icon;
            return (
              <motion.div
                key={platform.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-8 rounded-2xl border-2 border-border bg-card"
              >
                <div
                  className="h-14 w-14 rounded-xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: platform.color }}
                >
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-3">
                  {t(`platforms.${platform.key}.title`)}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {t(`platforms.${platform.key}.description`)}
                </p>
                <p
                  className="text-sm font-medium"
                  style={{ color: platform.color }}
                >
                  {t(`platforms.${platform.key}.access`)}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Parity */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-2 text-center">
            {t('parity_title')}
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-8">
            {t('parity_subtitle')}
          </p>
          <div className="rounded-2xl border-2 border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left font-semibold text-foreground p-4">
                    {t('parity_feature')}
                  </th>
                  <th className="font-semibold text-foreground p-4 w-20 text-center">
                    {t('parity_web')}
                  </th>
                  <th className="font-semibold text-foreground p-4 w-20 text-center">
                    {t('parity_desktop')}
                  </th>
                  <th className="font-semibold text-foreground p-4 w-20 text-center">
                    {t('parity_mobile')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {PARITY_ROWS.map((row) => (
                  <tr key={row} className="border-b border-border last:border-b-0">
                    <td className="p-4 text-muted-foreground">{t(`parity.${row}`)}</td>
                    {PARITY[row].map((value, i) => (
                      <td key={i} className="p-4 text-center">
                        <ParityCell value={value} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <p className="text-muted-foreground mb-4">{t('cta_text')}</p>
          <Link
            href="/guide"
            className="inline-flex items-center gap-2 text-[#06B6D4] hover:text-[#0891B2] font-medium transition-colors"
          >
            {t('cta_link')}
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
