'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { 
  Sparkles,
  Calendar,
  TrendingUp,
  ShieldAlert,
  FileText,
  Battery,
  Clock,
  Brain
} from 'lucide-react';

const AI_FEATURES = [
  { 
    icon: Calendar, 
    key: 'smart_scheduling',
    color: '#06B6D4',
  },
  { 
    icon: TrendingUp, 
    key: 'priority_intelligence',
    color: '#EC4899',
  },
  { 
    icon: ShieldAlert, 
    key: 'burnout_prevention',
    color: '#F97316',
  },
  { 
    icon: FileText, 
    key: 'weekly_reports',
    color: '#10B981',
  },
  { 
    icon: Battery, 
    key: 'energy_matching',
    color: '#A855F7',
  },
  { 
    icon: Clock, 
    key: 'task_estimation',
    color: '#3B82F6',
  },
];

export function AIFeatures() {
  const t = useTranslations('AIFeatures');

  return (
    <section className="py-24 lg:py-32 section-alt relative overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute top-16 left-16 w-28 h-28 border-4 border-[#A855F7]/10 rounded-full" />
      <div className="absolute bottom-16 right-16 w-20 h-20 border-4 border-[#06B6D4]/10 rotate-12" />
      
      <div className="container relative z-10 px-4 md:px-6">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#A855F7] text-white mb-6">
            <Brain className="h-4 w-4" />
            <span className="text-sm font-medium">{t('badge')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-foreground">
            {t('title')} <span className="text-[#A855F7]">{t('highlight')}</span>
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* AI Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {AI_FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            
            return (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className="relative h-full p-8 rounded-2xl bg-card border-2 border-border hover:border-[#A855F7]/50 transition-all duration-300 overflow-hidden">
                  {/* AI sparkle indicator */}
                  <div className="absolute top-4 right-4">
                    <Sparkles 
                      className="h-5 w-5 text-[#A855F7] opacity-50 group-hover:opacity-100 transition-opacity"
                    />
                  </div>

                  {/* Icon */}
                  <div 
                    className="h-14 w-14 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110"
                    style={{ backgroundColor: feature.color }}
                  >
                    <Icon className="h-7 w-7 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-3 text-foreground">
                    {t(`${feature.key}.title`)}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {t(`${feature.key}.description`)}
                  </p>

                  {/* How it works */}
                  <div 
                    className="text-sm font-medium px-3 py-2 rounded-lg inline-block"
                    style={{ 
                      backgroundColor: `${feature.color}15`,
                      color: feature.color
                    }}
                  >
                    {t(`${feature.key}.benefit`)}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom AI statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[#A855F7]/10 border-2 border-[#A855F7]/30">
            <Sparkles className="h-5 w-5 text-[#A855F7]" />
            <span className="text-sm font-medium text-foreground">
              {t('ai_statement')}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
