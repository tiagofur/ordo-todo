'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Layers, 
  Smartphone, 
  Brain, 
  Wallet, 
  Timer,
  CheckCircle2
} from 'lucide-react';

const ADVANTAGES = [
  { 
    icon: Layers, 
    key: 'all_in_one', 
    color: '#06B6D4',
    bgLight: '#ECFEFF',
    bgDark: '#083344'
  },
  { 
    icon: Smartphone, 
    key: 'cross_platform', 
    color: '#EC4899',
    bgLight: '#FDF2F8',
    bgDark: '#500724'
  },
  { 
    icon: Shield, 
    key: 'privacy', 
    color: '#10B981',
    bgLight: '#ECFDF5',
    bgDark: '#022C22'
  },
  { 
    icon: Brain, 
    key: 'ai_helps', 
    color: '#A855F7',
    bgLight: '#FAF5FF',
    bgDark: '#2E1065'
  },
  { 
    icon: Wallet, 
    key: 'no_lockin', 
    color: '#F97316',
    bgLight: '#FFF7ED',
    bgDark: '#431407'
  },
  { 
    icon: Timer, 
    key: 'focus_builtin', 
    color: '#06B6D4',
    bgLight: '#ECFEFF',
    bgDark: '#083344'
  },
];

export function WhyOrdo() {
  const t = useTranslations('WhyOrdo');

  return (
    <section className="py-24 lg:py-32 section-alt relative overflow-hidden">
      {/* Decorative geometric shapes */}
      <div className="absolute top-20 left-10 w-32 h-32 border-4 border-[#06B6D4]/10 rotate-12" />
      <div className="absolute bottom-20 right-10 w-24 h-24 border-4 border-[#EC4899]/10 rounded-full" />
      <div className="absolute top-1/2 right-1/4 w-16 h-16 border-4 border-[#10B981]/10 rotate-45" />

      <div className="container relative z-10 px-4 md:px-6">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#10B981] text-white mb-6">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm font-medium">{t('badge')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6 text-foreground">
            {t('title')}
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Advantages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {ADVANTAGES.map((advantage, index) => {
            const Icon = advantage.icon;
            
            return (
              <motion.div
                key={advantage.key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="group"
              >
                <div 
                  className="relative h-full p-8 rounded-2xl bg-card border-2 transition-all duration-300 ease-out overflow-hidden"
                  style={{ borderColor: `${advantage.color}30` }}
                >
                  {/* Colored top bar */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: advantage.color }}
                  />
                  
                  {/* Icon */}
                  <div 
                    className="relative h-14 w-14 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: advantage.color }}
                  >
                    <Icon className="h-7 w-7 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="relative text-xl font-semibold mb-3 text-foreground">
                    {t(`${advantage.key}.title`)}
                  </h3>
                  <p className="relative text-muted-foreground leading-relaxed">
                    {t(`${advantage.key}.description`)}
                  </p>

                  {/* Hover corner accent */}
                  <div 
                    className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                    style={{ backgroundColor: advantage.color }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
