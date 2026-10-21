'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
  Video,
  Users,
  Heart,
  Search,
  MessagesSquare,
  Trophy,
  Headphones,
} from 'lucide-react';
import { Link } from '@/i18n/routing';

// ODD 013 S12: existing features that marketing never sold. Every block
// below is verified in code (see promises-audit.md §I); each links to a
// working guide or back to the guide index — no dead links.
const BLOCKS = [
  { key: 'meetings', icon: Video, color: '#06B6D4', href: null as string | null },
  { key: 'workload', icon: Users, color: '#EC4899', href: null as string | null },
  { key: 'wellbeing', icon: Heart, color: '#F97316', href: null as string | null },
  { key: 'search', icon: Search, color: '#10B981', href: null as string | null },
  { key: 'coach', icon: MessagesSquare, color: '#A855F7', href: null as string | null },
  { key: 'gamification', icon: Trophy, color: '#3B82F6', href: null as string | null },
  { key: 'focusAudio', icon: Headphones, color: '#F59E0B', href: '/guide/focus' },
];

export default function MoreFeaturesGuide() {
  const t = useTranslations('GuideMore');

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-sm font-medium text-[#06B6D4]">{t('badge')}</span>
      </div>

      <h1 className="!mt-0">{t('title')}</h1>
      <p className="lead text-xl text-muted-foreground">{t('subtitle')}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
        {BLOCKS.map((block, index) => {
          const Icon = block.icon;
          return (
            <motion.div
              key={block.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-6 rounded-2xl bg-card border"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${block.color}20` }}
                >
                  <Icon className="h-5 w-5" style={{ color: block.color }} />
                </div>
                <h3 className="!m-0 text-lg font-semibold">
                  {t(`${block.key}.title`)}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {t(`${block.key}.description`)}
              </p>
              {block.href && (
                <Link
                  href={block.href}
                  className="inline-block mt-3 text-sm font-medium text-[#06B6D4] hover:underline"
                >
                  {t('openInApp')} →
                </Link>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
