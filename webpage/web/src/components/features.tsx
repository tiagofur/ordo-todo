'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { 
  Layout, 
  Clock, 
  Sparkles, 
  Smartphone, 
  BarChart3, 
  Shield,
  Target,
  Calendar,
  Zap
} from 'lucide-react';

const FEATURE_COLORS = {
  cyan: { bg: 'bg-[#06B6D4]/10', text: 'text-[#06B6D4]', border: 'border-[#06B6D4]/20', glow: 'shadow-[#06B6D4]/20' },
  pink: { bg: 'bg-[#EC4899]/10', text: 'text-[#EC4899]', border: 'border-[#EC4899]/20', glow: 'shadow-[#EC4899]/20' },
  orange: { bg: 'bg-[#F97316]/10', text: 'text-[#F97316]', border: 'border-[#F97316]/20', glow: 'shadow-[#F97316]/20' },
  green: { bg: 'bg-[#10B981]/10', text: 'text-[#10B981]', border: 'border-[#10B981]/20', glow: 'shadow-[#10B981]/20' },
  purple: { bg: 'bg-[#A855F7]/10', text: 'text-[#A855F7]', border: 'border-[#A855F7]/20', glow: 'shadow-[#A855F7]/20' },
  blue: { bg: 'bg-[#3B82F6]/10', text: 'text-[#3B82F6]', border: 'border-[#3B82F6]/20', glow: 'shadow-[#3B82F6]/20' },
};

export function Features() {
  const t = useTranslations('Features');

  const features = [
    { icon: Layout, key: 'organization', color: 'cyan' },
    { icon: Clock, key: 'time_management', color: 'pink' },
    { icon: Sparkles, key: 'ai_powered', color: 'purple' },
    { icon: Smartphone, key: 'cross_platform', color: 'orange' },
    { icon: BarChart3, key: 'productivity', color: 'green' },
    { icon: Shield, key: 'privacy', color: 'blue' },
  ];

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
      
      <div className="container relative z-10 px-4 md:px-6">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#06B6D4]/10 border border-[#06B6D4]/20 mb-6">
            <Zap className="h-4 w-4 text-[#06B6D4]" />
            <span className="text-sm font-medium text-[#06B6D4]">{t('badge')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            {t('title')}
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const colors = FEATURE_COLORS[feature.color as keyof typeof FEATURE_COLORS];
            const Icon = feature.icon;
            
            return (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="group"
              >
                <div className={`
                  relative h-full p-8 rounded-2xl bg-card border ${colors.border}
                  hover:shadow-xl ${colors.glow} 
                  transition-all duration-300 ease-out
                  overflow-hidden
                `}>
                  {/* Gradient Glow on Hover */}
                  <div className={`
                    absolute inset-0 opacity-0 group-hover:opacity-100 
                    transition-opacity duration-500
                    bg-gradient-to-br ${colors.bg.replace('/10', '/5')} to-transparent
                  `} />
                  
                  {/* Icon */}
                  <div className={`
                    relative h-14 w-14 rounded-xl ${colors.bg} 
                    flex items-center justify-center mb-6
                    group-hover:scale-110 transition-transform duration-300
                  `}>
                    <Icon className={`h-7 w-7 ${colors.text}`} />
                  </div>

                  {/* Content */}
                  <h3 className="relative text-xl font-semibold mb-3 group-hover:text-foreground transition-colors">
                    {t(`${feature.key}.title`)}
                  </h3>
                  <p className="relative text-muted-foreground leading-relaxed">
                    {t(`${feature.key}.description`)}
                  </p>

                  {/* Corner Accent */}
                  <div className={`
                    absolute -bottom-12 -right-12 w-32 h-32 
                    ${colors.bg} rounded-full blur-2xl opacity-0 
                    group-hover:opacity-100 transition-opacity duration-500
                  `} />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Additional Features Row */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        >
          {[
            { icon: Target, key: 'okr', value: '100%' },
            { icon: Calendar, key: 'calendar', value: 'Real-time' },
            { icon: Zap, key: 'speed', value: '<100ms' },
            { icon: Shield, key: 'uptime', value: '99.9%' },
          ].map((stat, i) => (
            <div key={stat.key} className="space-y-2">
              <stat.icon className="h-8 w-8 mx-auto text-muted-foreground/60" />
              <p className="text-2xl font-bold text-[#06B6D4]">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{t(`stats.${stat.key}`)}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
