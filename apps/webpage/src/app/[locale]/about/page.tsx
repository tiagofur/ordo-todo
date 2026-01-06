'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Users, Heart, Shield, Globe, Sparkles } from 'lucide-react';

export default function AboutPage() {
  const t = useTranslations('About');

  const values = [
    { key: 'users', icon: Users, color: '#06B6D4' },
    { key: 'passion', icon: Heart, color: '#EC4899' },
    { key: 'privacy', icon: Shield, color: '#F97316' },
    { key: 'global', icon: Globe, color: '#10B981' },
  ];

  return (
    <main className="min-h-screen bg-background pt-24 pb-16">
      <div className="container px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#06B6D4] text-white mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">{t('badge')}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 text-foreground">
            {t('title')}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-2 gap-12 items-center mb-24"
        >
          <div>
            <h2 className="text-3xl font-bold mb-6">{t('mission.title')}</h2>
            <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
              <p>{t('mission.text1')}</p>
              <p>{t('mission.text2')}</p>
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden bg-muted aspect-video md:aspect-square lg:aspect-video flex items-center justify-center border">
            <div className="absolute inset-0 bg-[#06B6D4]/10" />
             {/* Placeholder for About Image - could be a team photo or office */}
             <Users className="h-24 w-24 text-[#06B6D4]/40" />
          </div>
        </motion.div>

        {/* Values */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t('values.title')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('values.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="p-6 rounded-2xl border bg-card hover:shadow-lg transition-all"
                >
                  <div 
                    className="h-12 w-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${value.color}20` }}
                  >
                    <Icon className="h-6 w-6" style={{ color: value.color }} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{t(`values.${value.key}.title`)}</h3>
                  <p className="text-muted-foreground text-sm">
                    {t(`values.${value.key}.description`)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Founder Note (Simplified) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-4xl mx-auto text-center bg-[#F97316]/5 border border-[#F97316]/20 rounded-3xl p-8 md:p-12"
        >
          <div className="mb-6">
            <Heart className="h-12 w-12 text-[#F97316] mx-auto" />
          </div>
          <blockquote className="text-xl md:text-2xl font-medium text-foreground mb-6">
            &quot;{t('quote')}&quot;
          </blockquote>
          <cite className="not-italic text-muted-foreground">
             Ordo Todo Team
          </cite>
        </motion.div>
      </div>
    </main>
  );
}
