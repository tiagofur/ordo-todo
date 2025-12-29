'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { 
  LayoutGrid, 
  Columns3, 
  CalendarClock, 
  Timer, 
  Target,
  Users,
  Star
} from 'lucide-react';

const STAR_FEATURES = [
  { 
    icon: LayoutGrid, 
    key: 'eisenhower', 
    color: '#06B6D4',
  },
  { 
    icon: Columns3, 
    key: 'kanban', 
    color: '#EC4899',
  },
  { 
    icon: CalendarClock, 
    key: 'time_blocking', 
    color: '#F97316',
  },
  { 
    icon: Timer, 
    key: 'focus_timer', 
    color: '#10B981',
  },
  { 
    icon: Target, 
    key: 'okrs', 
    color: '#A855F7',
  },
  { 
    icon: Users, 
    key: 'collaboration', 
    color: '#3B82F6',
  },
];

export function StarFeatures() {
  const t = useTranslations('StarFeatures');

  return (
    <section className="py-24 lg:py-32 bg-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 right-20 w-20 h-20 border-4 border-[#F97316]/10 rounded-full" />
      <div className="absolute bottom-10 left-20 w-16 h-16 border-4 border-[#A855F7]/10 rotate-45" />

      <div className="container relative z-10 px-4 md:px-6">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F97316] text-white mb-6">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm font-medium">{t('badge')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-foreground">
            {t('title')}
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Features Grid - 2x3 layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {STAR_FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            
            return (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                className="group"
              >
                <div 
                  className="relative h-full p-8 rounded-2xl border-2 bg-card transition-all duration-300 hover:shadow-xl"
                  style={{ borderColor: feature.color }}
                >
                  {/* Icon with solid color background */}
                  <div 
                    className="h-16 w-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                    style={{ backgroundColor: feature.color }}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-3 text-foreground">
                    {t(`${feature.key}.title`)}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {t(`${feature.key}.description`)}
                  </p>

                  {/* Feature highlights */}
                  <div className="flex flex-wrap gap-2">
                    {[0, 1, 2].map((i) => (
                      <span 
                        key={i}
                        className="px-3 py-1 text-xs font-medium rounded-full"
                        style={{ 
                          backgroundColor: `${feature.color}15`,
                          color: feature.color
                        }}
                      >
                        {t(`${feature.key}.highlights.${i}`)}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
