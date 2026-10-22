'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import {
  CheckSquare,
  Timer,
  Repeat,
  CalendarDays,
  Bot,
  Sparkles,
  Search,
  MessagesSquare,
  MoonStar,
  Trophy,
  Video,
  Plug,
  ArrowRight,
} from 'lucide-react';

const FEATURES = [
  { key: 'tasks', icon: CheckSquare, color: '#06B6D4', href: '/guide/tasks' },
  { key: 'focus', icon: Timer, color: '#EC4899', href: '/guide/focus' },
  { key: 'habits', icon: Repeat, color: '#F97316', href: '/guide/habits' },
  { key: 'plan', icon: CalendarDays, color: '#10B981', href: '/guide/scheduling' },
  { key: 'ritual', icon: MoonStar, color: '#A855F7', href: '/guide/ritual' },
  { key: 'agent', icon: Bot, color: '#3B82F6', href: '/guide/agent' },
  { key: 'scheduling', icon: Sparkles, color: '#06B6D4', href: '/guide/scheduling' },
  { key: 'search', icon: Search, color: '#EC4899', href: '/guide/more-features' },
  { key: 'coach', icon: MessagesSquare, color: '#F97316', href: '/guide/more-features' },
  { key: 'gamification', icon: Trophy, color: '#10B981', href: '/guide/more-features' },
  { key: 'meetings', icon: Video, color: '#A855F7', href: '/guide/more-features' },
  { key: 'integrations', icon: Plug, color: '#3B82F6', href: '/guide/connect' },
];

export default function FeaturesPage() {
  const t = useTranslations('FeaturesPage');

  return (
    <main className="min-h-screen bg-background pt-24 pb-16">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#06B6D4] text-white mb-6">
            <CheckSquare className="h-4 w-4" />
            <span className="text-sm font-medium">{t('badge')}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 text-foreground">
            {t('title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={feature.href}
                  className="group block h-full p-6 rounded-2xl border-2 border-border bg-card hover:shadow-xl transition-all duration-300"
                >
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${feature.color}20` }}
                  >
                    <Icon className="h-6 w-6" style={{ color: feature.color }} />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2 flex items-center justify-between gap-2">
                    {t(`${feature.key}.title`)}
                    <ArrowRight
                      className="h-4 w-4 shrink-0 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                      style={{ color: feature.color }}
                    />
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(`${feature.key}.description`)}
                  </p>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16"
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
