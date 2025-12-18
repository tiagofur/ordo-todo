'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Timer, Zap, Coffee, Moon } from 'lucide-react';

export default function FocusGuide() {
  const t = useTranslations('GuideFocus');

  const timerModes = [
    { key: 'focus', icon: Zap, color: '#EC4899' },
    { key: 'short', icon: Coffee, color: '#10B981' },
    { key: 'long', icon: Moon, color: '#3B82F6' },
  ];

  return (
    <div>
      {/* Header Badge */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
          <Timer className="h-5 w-5 text-[#10B981]" />
        </div>
        <span className="text-sm font-medium text-[#10B981]">{t('badge')}</span>
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
        <img 
          src="/images/guide/focus.png" 
          alt="Focus Timer" 
          className="w-full rounded-xl border shadow-2xl"
        />
      </motion.div>

      <h2>{t('pomodoro_title')}</h2>
      <p>{t('pomodoro_text')}</p>

      <h2>{t('modes_title')}</h2>
      <div className="not-prose grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        {timerModes.map((mode, index) => {
          const Icon = mode.icon;
          return (
            <motion.div
              key={mode.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-5 rounded-xl border bg-card text-center"
            >
              <div 
                className="h-14 w-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${mode.color}20` }}
              >
                <Icon className="h-7 w-7" style={{ color: mode.color }} />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{t(`modes.${mode.key}.title`)}</h3>
              <p className="text-2xl font-bold mb-2" style={{ color: mode.color }}>{t(`modes.${mode.key}.duration`)}</p>
              <p className="text-sm text-muted-foreground">{t(`modes.${mode.key}.description`)}</p>
            </motion.div>
          );
        })}
      </div>

      <h2>{t('how_to_title')}</h2>
      <div className="not-prose space-y-3 my-6">
        {[1, 2, 3, 4].map((step, index) => (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-4 p-4 rounded-xl border bg-card"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#10B981] to-[#06B6D4] flex items-center justify-center text-white font-bold text-sm">
              {step}
            </div>
            <p className="text-foreground">{t(`steps.${step}`)}</p>
          </motion.div>
        ))}
      </div>

      <h2>{t('shortcuts_title')}</h2>
      <div className="not-prose overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <tbody className="divide-y">
            <tr className="bg-card">
              <td className="px-4 py-3"><kbd className="px-2 py-1 rounded bg-muted text-xs font-mono">Space</kbd></td>
              <td className="px-4 py-3 text-muted-foreground">{t('shortcuts.space')}</td>
            </tr>
            <tr className="bg-card">
              <td className="px-4 py-3"><kbd className="px-2 py-1 rounded bg-muted text-xs font-mono">R</kbd></td>
              <td className="px-4 py-3 text-muted-foreground">{t('shortcuts.r')}</td>
            </tr>
            <tr className="bg-card">
              <td className="px-4 py-3"><kbd className="px-2 py-1 rounded bg-muted text-xs font-mono">S</kbd></td>
              <td className="px-4 py-3 text-muted-foreground">{t('shortcuts.s')}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Tip */}
      <div className="not-prose p-6 rounded-xl bg-gradient-to-r from-[#10B981]/10 to-[#06B6D4]/10 border border-[#10B981]/20 mt-8">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">{t('pro_tip')}:</strong> {t('pro_tip_text')}
        </p>
      </div>
    </div>
  );
}
