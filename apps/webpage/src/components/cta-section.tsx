'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Button } from '@ordo-todo/ui';
import { ArrowRight, Sparkles, Check } from 'lucide-react';

export function CallToAction() {
  const t = useTranslations('CTA');

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden bg-[#EC4899]">
      {/* Decorative geometric elements with solid colors */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large circles */}
        <motion.div 
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute -top-20 -left-20 w-80 h-80 border-[12px] border-white/10 rounded-full"
        />
        <motion.div 
          animate={{ rotate: [360, 0] }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-20 -right-20 w-96 h-96 border-[12px] border-white/10 rounded-full"
        />
        
        {/* Accent squares */}
        <div className="absolute top-1/4 right-1/4 w-12 h-12 border-4 border-white/20 rotate-45" />
        <div className="absolute bottom-1/4 left-1/4 w-8 h-8 bg-white/10" />
        <div className="absolute top-1/2 left-20 w-6 h-6 bg-white/10 rotate-12" />
        <div className="absolute bottom-1/3 right-32 w-10 h-10 border-4 border-white/20 rounded-full" />
      </div>

      <div className="container relative z-10 px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 border-2 border-white/30 mb-8"
          >
            <Sparkles className="h-4 w-4 text-white" />
            <span className="text-sm font-medium text-white">{t('badge')}</span>
          </motion.div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
            {t('title')}
          </h2>
          
          <p className="text-lg lg:text-xl text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t('description')}
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://ordotodo.app/register" target="_blank" rel="noreferrer">
              <Button 
                size="lg" 
                className="w-full sm:w-auto h-14 px-10 text-lg font-semibold bg-white text-[#EC4899] hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all duration-300 group"
              >
                {t('button_primary')}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
            <a href="https://ordotodo.app/login" target="_blank" rel="noreferrer">
              <Button 
                size="lg" 
                variant="outline"
                className="w-full sm:w-auto h-14 px-10 text-lg font-semibold border-2 border-white bg-transparent text-white hover:bg-white hover:text-[#EC4899] transition-all duration-300"
              >
                {t('button_secondary')}
              </Button>
            </a>
          </div>

          {/* Trust Indicators */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-8 text-white/90"
          >
            {['no_card', 'free', 'cancel'].map((key) => (
              <div key={key} className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium">{t(`trust.${key}`)}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
