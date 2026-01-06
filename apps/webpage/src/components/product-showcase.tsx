'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { 
  Layers, 
  Timer, 
  Brain, 
  BarChart3,
  Target,
  ArrowRight
} from 'lucide-react';
import Image from 'next/image';

export function ProductShowcase() {
  const t = useTranslations('ProductShowcase');

  const items = [
    {
      id: 'tasks',
      icon: Layers,
      color: '#06B6D4',
      image: '/images/guide/dashboard.png',
      reverse: false
    },
    {
      id: 'focus',
      icon: Timer,
      color: '#EC4899',
      image: '/images/guide/focus.png',
      reverse: true
    },
    {
      id: 'ai',
      icon: Brain,
      color: '#A855F7',
      image: '/images/guide/analytics.png',
      reverse: false
    },
    {
      id: 'analytics',
      icon: BarChart3,
      color: '#10B981',
      image: '/images/guide/analytics.png',
      reverse: true
    },
  ];

  return (
    <section className="py-24 lg:py-32 section-alt">
      <div className="container px-4 md:px-6">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#A855F7] text-white mb-6">
            <Target className="h-4 w-4" />
            <span className="text-sm font-medium">{t('badge')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-foreground">
            {t('title')} <span className="text-[#EC4899]">{t('highlight')}</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Showcase Items */}
        <div className="space-y-32">
          {items.map((item) => {
            const Icon = item.icon;
            
            // Access features array safely
            const features = [0, 1, 2, 3].map(i => t(`items.${item.id}.features.${i}`));

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className={`flex flex-col ${item.reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-20`}
              >
                {/* Content */}
                <div className="flex-1 max-w-xl">
                  <div 
                    className="inline-flex h-14 w-14 rounded-2xl items-center justify-center mb-6"
                    style={{ backgroundColor: item.color }}
                  >
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold mb-4 text-foreground">
                    {t(`items.${item.id}.title`)}
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                    {t(`items.${item.id}.description`)}
                  </p>
                  
                  {/* Feature Pills */}
                  <div className="flex flex-wrap gap-3 mb-8">
                    {features.map((feature, i) => (
                      <span 
                        key={i}
                        className="px-4 py-2 rounded-full text-sm font-medium border-2"
                        style={{ 
                          borderColor: item.color,
                          color: item.color 
                        }}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  <Link 
                    href="/guide"
                    className="inline-flex items-center gap-2 text-sm font-semibold group"
                    style={{ color: item.color }}
                  >
                    {t('learn_more')}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {/* Image */}
                <motion.div 
                  className="flex-1 relative"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Solid color border decoration */}
                  <div 
                    className="absolute -inset-2 rounded-3xl border-4"
                    style={{ borderColor: `${item.color}30` }}
                  />
                  <div 
                    className="absolute -inset-4 rounded-3xl border-4"
                    style={{ borderColor: `${item.color}15` }}
                  />
                  
                  <div 
                    className="relative rounded-2xl overflow-hidden border-2 shadow-2xl bg-card"
                    style={{ borderColor: `${item.color}50` }}
                  >
                    <Image 
                      src={item.image}
                      alt={item.id}
                      width={1200}
                      height={800}
                      className="w-full h-auto"
                    />
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
