'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Button } from '@ordo-todo/ui';
import { Link } from '@/i18n/routing';
import { ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

export function Hero() {
  const t = useTranslations('Hero');

  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 bg-background">
      {/* Solid Color Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large geometric shapes with solid colors */}
        <motion.div 
          animate={{ rotate: [0, 10, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 w-80 h-80 border-8 border-[#06B6D4]/10 rounded-full"
        />
        <motion.div 
          animate={{ rotate: [0, -10, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -right-40 w-96 h-96 border-8 border-[#EC4899]/10"
          style={{ transform: 'rotate(45deg)' }}
        />
        <motion.div 
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 left-1/4 w-64 h-64 border-8 border-[#F97316]/10 rounded-full"
        />
        {/* Small accent squares */}
        <div className="absolute top-1/3 left-20 w-8 h-8 bg-[#06B6D4]" />
        <div className="absolute bottom-1/4 right-32 w-6 h-6 bg-[#EC4899]" />
        <div className="absolute top-1/2 right-20 w-4 h-4 bg-[#10B981]" />
      </div>

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(148 163 184 / 0.05)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
        }}
      />

      <div className="container relative z-10 px-4 md:px-6 py-20 lg:py-32">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 text-center lg:text-left max-w-2xl"
          >
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#06B6D4] text-white mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <span className="text-sm font-medium">{t('badge')}</span>
            </motion.div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.15]">
              <span className="block text-foreground">{t('title')}</span>
              <span className="block mt-2 text-[#EC4899]">
                {t('highlight')}
              </span>
            </h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-8 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0"
            >
              {t('description')}
            </motion.p>

            {/* Feature Pills */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center lg:justify-start gap-3 mt-8"
            >
              {['pomodoro', 'ai', 'cross'].map((key, i) => {
                const colors = ['#06B6D4', '#A855F7', '#F97316'];
                return (
                  <div 
                    key={key} 
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                    style={{ 
                      backgroundColor: `${colors[i]}15`,
                      color: colors[i]
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4" style={{ color: colors[i] }} />
                    <span>{t(`features.${key}`)}</span>
                  </div>
                );
              })}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <a href="https://ordotodo.app/register" target="_blank" rel="noreferrer">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto h-14 px-8 text-lg font-semibold bg-[#06B6D4] hover:bg-[#0891B2] text-white border-0 shadow-lg shadow-[#06B6D4]/30 transition-all duration-300 group"
                >
                  {t('cta_primary')}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </a>
              <Link href="/guide">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto h-14 px-8 text-lg font-semibold border-2 border-[#EC4899] text-[#EC4899] hover:bg-[#EC4899] hover:text-white group"
                >
                  <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  {t('cta_secondary')}
                </Button>
              </Link>
            </motion.div>

            {/* Social Proof */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-12 flex items-center justify-center lg:justify-start gap-6"
            >
              <div className="flex -space-x-3">
                {[
                  { letter: 'A', color: '#06B6D4' },
                  { letter: 'B', color: '#EC4899' },
                  { letter: 'C', color: '#F97316' },
                  { letter: 'D', color: '#10B981' },
                  { letter: 'E', color: '#A855F7' },
                ].map((user) => (
                  <div 
                    key={user.letter} 
                    className="w-10 h-10 rounded-full border-2 border-background flex items-center justify-center"
                    style={{ backgroundColor: user.color }}
                  >
                    <span className="text-white text-xs font-bold">{user.letter}</span>
                  </div>
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-bold text-foreground">2,500+</span> {t('social_proof')}
              </div>
            </motion.div>
          </motion.div>

          {/* Right - App Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50, rotateY: -10 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex-1 relative"
          >
            <motion.div animate={floatingAnimation} className="relative">
              {/* Solid color border instead of gradient glow */}
              <div className="absolute -inset-2 rounded-3xl border-4 border-[#06B6D4]/20" />
              <div className="absolute -inset-4 rounded-3xl border-4 border-[#EC4899]/10" />
              
              {/* App Screenshot Container */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-[#06B6D4]/30 shadow-2xl bg-card">
                <Image 
                  src="/images/guide/dashboard.png" 
                  alt="Ordo Todo Dashboard Preview"
                  width={1200}
                  height={800}
                  className="w-full h-auto"
                  priority
                />
              </div>

              {/* Floating Cards with solid colors */}
              <motion.div 
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -left-8 top-1/4 p-4 rounded-xl bg-card border-2 border-[#10B981] shadow-xl hidden lg:block"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#10B981] flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Task Completed</p>
                    <p className="text-xs text-muted-foreground">Design Review</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [5, -5, 5] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-6 bottom-1/3 p-4 rounded-xl bg-card border-2 border-[#F97316] shadow-xl hidden lg:block"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#F97316] flex items-center justify-center">
                    <span className="text-lg">🔥</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">5 Day Streak!</p>
                    <p className="text-xs text-muted-foreground">Keep it up</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
