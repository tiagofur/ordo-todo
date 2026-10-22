'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { Scale, Check, Minus, X } from 'lucide-react';

const ROWS = [
  'tasks',
  'capture',
  'calendar',
  'habits',
  'focus',
  'wellbeing',
  'okrs',
  'agents',
  'platforms',
  'price',
] as const;

type CellValue = 'yes' | 'partial' | 'no' | 'text';

interface RowDef {
  ordo: CellValue;
  todoist: CellValue;
  notion: CellValue;
  motion: CellValue;
}

const TABLE: Record<(typeof ROWS)[number], RowDef> = {
  tasks: { ordo: 'yes', todoist: 'yes', notion: 'partial', motion: 'yes' },
  capture: { ordo: 'partial', todoist: 'yes', notion: 'partial', motion: 'partial' },
  calendar: { ordo: 'yes', todoist: 'partial', notion: 'partial', motion: 'yes' },
  habits: { ordo: 'yes', todoist: 'no', notion: 'partial', motion: 'no' },
  focus: { ordo: 'yes', todoist: 'no', notion: 'no', motion: 'partial' },
  wellbeing: { ordo: 'yes', todoist: 'no', notion: 'no', motion: 'no' },
  okrs: { ordo: 'yes', todoist: 'no', notion: 'partial', motion: 'no' },
  agents: { ordo: 'yes', todoist: 'no', notion: 'yes', motion: 'no' },
  platforms: { ordo: 'yes', todoist: 'yes', notion: 'yes', motion: 'partial' },
  price: { ordo: 'text', todoist: 'text', notion: 'text', motion: 'text' },
};

function Cell({ value, text }: { value: CellValue; text?: string }) {
  if (value === 'text') return <span className="text-xs text-muted-foreground">{text}</span>;
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

export default function ComparePage() {
  const t = useTranslations('ComparePage');

  return (
    <main className="min-h-screen bg-background pt-24 pb-16">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F97316] text-white mb-6">
            <Scale className="h-4 w-4" />
            <span className="text-sm font-medium">{t('badge')}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 text-foreground">
            {t('title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="max-w-4xl mx-auto mb-10 p-5 rounded-xl bg-[#F97316]/10 border border-[#F97316]/20"
        >
          <p className="text-sm text-muted-foreground">{t('honesty_note')}</p>
        </motion.div>

        <div className="max-w-5xl mx-auto mb-16">
          <div className="rounded-2xl border-2 border-border bg-card overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left font-semibold text-foreground p-4">
                    {t('col_feature')}
                  </th>
                  <th className="font-semibold p-4 w-28 text-center text-[#06B6D4]">
                    {t('col_ordo')}
                  </th>
                  <th className="font-semibold text-foreground p-4 w-28 text-center">
                    {t('col_todoist')}
                  </th>
                  <th className="font-semibold text-foreground p-4 w-28 text-center">
                    {t('col_notion')}
                  </th>
                  <th className="font-semibold text-foreground p-4 w-28 text-center">
                    {t('col_motion')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row} className="border-b border-border last:border-b-0">
                    <td className="p-4 text-muted-foreground">{t(`rows.${row}.label`)}</td>
                    <td className="p-4 text-center bg-[#06B6D4]/5">
                      <Cell
                        value={TABLE[row].ordo}
                        text={TABLE[row].ordo === 'text' ? t(`rows.${row}.ordo`) : undefined}
                      />
                    </td>
                    <td className="p-4 text-center">
                      <Cell
                        value={TABLE[row].todoist}
                        text={TABLE[row].todoist === 'text' ? t(`rows.${row}.todoist`) : undefined}
                      />
                    </td>
                    <td className="p-4 text-center">
                      <Cell
                        value={TABLE[row].notion}
                        text={TABLE[row].notion === 'text' ? t(`rows.${row}.notion`) : undefined}
                      />
                    </td>
                    <td className="p-4 text-center">
                      <Cell
                        value={TABLE[row].motion}
                        text={TABLE[row].motion === 'text' ? t(`rows.${row}.motion`) : undefined}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            {t('sources_note')}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <p className="text-muted-foreground mb-4">{t('cta_text')}</p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-[#06B6D4] hover:text-[#0891B2] font-medium transition-colors"
          >
            {t('cta_link')}
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
