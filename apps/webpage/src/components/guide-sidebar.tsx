'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Layout,
  CheckSquare,
  Timer,
  BarChart3,
  Plug,
  ChevronRight,
  Sparkles,
  Repeat,
  Hourglass,
  Zap,
  CalendarDays,
  Hash,
  Bot,
  Wand2,
  MoonStar,
  Briefcase,
  Target,
  StickyNote,
  LayoutGrid,
  Video,
  MessagesSquare,
  HeartPulse
} from 'lucide-react';

export function GuideSidebar() {
  const t = useTranslations('Guide');
  const pathname = usePathname();

  const guideItems = [
    { 
      key: 'getting_started', 
      href: '/guide', 
      icon: BookOpen,
      color: '#06B6D4',
    },
    { 
      key: 'projects', 
      href: '/guide/projects', 
      icon: Layout,
      color: '#EC4899',
    },
    { 
      key: 'tasks', 
      href: '/guide/tasks', 
      icon: CheckSquare,
      color: '#F97316',
    },
    {
      key: 'capture',
      href: '/guide/capture',
      icon: Zap,
      color: '#3B82F6',
    },
    {
      key: 'notes',
      href: '/guide/notes',
      icon: StickyNote,
      color: '#EAB308',
    },
    {
      key: 'workspaces',
      href: '/guide/workspaces',
      icon: Briefcase,
      color: '#F97316',
    },
    {
      key: 'focus',
      href: '/guide/focus',
      icon: Timer,
      color: '#10B981',
    },
    {
      key: 'habits',
      href: '/guide/habits',
      icon: Repeat,
      color: '#F97316',
    },
    {
      key: 'pomodoro',
      href: '/guide/pomodoro',
      icon: Hourglass,
      color: '#EF4444',
    },
    {
      key: 'calendar',
      href: '/guide/calendar',
      icon: CalendarDays,
      color: '#06B6D4',
    },
    {
      key: 'ritual',
      href: '/guide/ritual',
      icon: MoonStar,
      color: '#A855F7',
    },
    {
      key: 'scheduling',
      href: '/guide/scheduling',
      icon: Wand2,
      color: '#06B6D4',
    },
    {
      key: 'goals',
      href: '/guide/goals',
      icon: Target,
      color: '#F97316',
    },
    {
      key: 'eisenhower',
      href: '/guide/eisenhower',
      icon: LayoutGrid,
      color: '#8B5CF6',
    },
    {
      key: 'meetings',
      href: '/guide/meetings',
      icon: Video,
      color: '#06B6D4',
    },
    {
      key: 'coach',
      href: '/guide/coach',
      icon: MessagesSquare,
      color: '#3B82F6',
    },
    {
      key: 'agent',
      href: '/guide/agent',
      icon: Bot,
      color: '#3B82F6',
    },
    {
      key: 'analytics',
      href: '/guide/analytics',
      icon: BarChart3,
      color: '#A855F7',
    },
    {
      key: 'wellbeing',
      href: '/guide/wellbeing',
      icon: HeartPulse,
      color: '#EC4899',
    },
    {
      key: 'slack', 
      href: '/guide/slack', 
      icon: Hash,
      color: '#4A154B',
    },
    {
      key: 'connect',
      href: '/guide/connect',
      icon: Plug,
      color: '#06B6D4',
    },
    {
      key: 'more_features',
      href: '/guide/more-features',
      icon: Sparkles,
      color: '#F59E0B',
    },
  ];

  return (
    <aside className="hidden lg:block w-72 shrink-0">
      <div className="sticky top-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-[#06B6D4] flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">{t('header.title')}</h3>
            <p className="text-xs text-muted-foreground">{t('header.subtitle')}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {guideItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/guide' && pathname?.startsWith(item.href));
            
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={item.href}
                  className={`
                    group flex items-center gap-3 px-4 py-3 rounded-xl
                    transition-all duration-200
                    ${isActive 
                      ? 'bg-[#06B6D4]/10 border border-[#06B6D4]/20' 
                      : 'hover:bg-muted/50'
                    }
                  `}
                >
                  <div 
                    className={`
                      h-9 w-9 rounded-lg flex items-center justify-center shrink-0
                      transition-transform duration-200 group-hover:scale-110
                    `}
                    style={{ 
                      backgroundColor: `${item.color}15`,
                    }}
                  >
                    <Icon className="h-4 w-4" style={{ color: item.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isActive ? 'text-foreground' : 'text-foreground/80'}`}>
                      {t(`sidebar.${item.key}`)}
                    </p>
                  </div>
                  <ChevronRight 
                    className={`h-4 w-4 text-muted-foreground/50 transition-transform duration-200 
                      ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                      group-hover:translate-x-0.5
                    `} 
                  />
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* CTA Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 p-4 rounded-xl bg-[#06B6D4]/10 border border-[#06B6D4]/20"
        >
          <p className="text-sm font-medium text-foreground mb-2">{t('sidebar.need_help')}</p>
          <p className="text-xs text-muted-foreground mb-3">
            {t('sidebar.community_text')}
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-1 text-xs font-medium text-[#06B6D4] hover:text-[#0891B2] transition-colors"
          >
            {t('sidebar.community_link')}
            <ChevronRight className="h-3 w-3" />
          </Link>
        </motion.div>
      </div>
    </aside>
  );
}
