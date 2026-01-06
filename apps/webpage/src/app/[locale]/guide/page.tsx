'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Rocket, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import Image from 'next/image';

export default function GuidePage() {
  const t = useTranslations('Guide');

  const stepColors = ['#06B6D4', '#EC4899', '#F97316', '#10B981', '#A855F7'];

  const cardColors = [
    { color: '#EC4899', href: '/guide/projects' },
    { color: '#F97316', href: '/guide/tasks' },
    { color: '#10B981', href: '/guide/focus' },
    { color: '#A855F7', href: '/guide/analytics' },
  ];

  return (
    <div>
      {/* Hero Image */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative mb-12 rounded-2xl overflow-hidden"
      >
        <div className="absolute inset-0 bg-[#06B6D4]/10 rounded-2xl" />
        <Image 
          src="/images/guide/dashboard.png" 
          alt="Ordo Todo Dashboard" 
          width={1200}
          height={675}
          className="w-full rounded-2xl border shadow-2xl"
        />
      </motion.div>

      {/* Intro */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-[#06B6D4]/20 flex items-center justify-center">
            <Rocket className="h-5 w-5 text-[#06B6D4]" />
          </div>
          <span className="text-sm font-medium text-[#06B6D4]">{t('main.badge')}</span>
        </div>
        <h1 className="!mt-0">{t('title')}</h1>
        <p className="lead text-xl">{t('description')}</p>
        <p>
          {t('main.welcome')} <strong>Ordo Todo</strong>! {t('main.welcome_text')}
        </p>
      </div>

      {/* Quick Start Steps */}
      <h2>{t('main.quick_start_title')}</h2>
      <div className="not-prose space-y-4 mb-12">
        {[1, 2, 3, 4, 5].map((step, index) => (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex gap-4 p-4 rounded-xl border bg-card hover:shadow-lg transition-all duration-300"
          >
            <div 
              className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 text-white font-bold"
              style={{ backgroundColor: stepColors[index] }}
            >
              {step}
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">{t(`main.steps.${step}.title`)}</h3>
              <p className="text-sm text-muted-foreground">{t(`main.steps.${step}.description`)}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tips */}
      <div className="not-prose p-6 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 mb-12">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-full bg-[#10B981]/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5 text-[#10B981]" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">{t('main.pro_tip')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('main.pro_tip_text')} <kbd className="px-2 py-1 rounded bg-muted text-xs font-mono">{t('main.pro_tip_shortcut')}</kbd> {t('main.pro_tip_end')}
            </p>
          </div>
        </div>
      </div>

      {/* Explore More */}
      <h2>{t('main.explore_title')}</h2>
      <p>{t('main.explore_text')}</p>
      <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-4">
        {['projects', 'tasks', 'focus', 'analytics'].map((card, index) => (
          <motion.div
            key={card}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
          >
            <Link
              href={cardColors[index].href}
              className="group block p-5 rounded-xl border bg-card hover:shadow-xl transition-all duration-300"
            >
              <h3 className="font-semibold text-foreground mb-1 flex items-center justify-between">
                {t(`cards.${card}.title`)}
                <ArrowRight 
                  className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" 
                  style={{ color: cardColors[index].color }}
                />
              </h3>
              <p className="text-sm text-muted-foreground">{t(`cards.${card}.description`)}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
