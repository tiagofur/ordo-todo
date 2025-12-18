'use client';

import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Button } from '@ordo-todo/ui';
import { motion } from 'framer-motion';
import { Menu, X, Sparkles } from 'lucide-react';
import { useState } from 'react';

export function Navigation() {
  const t = useTranslations('Navigation');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="fixed top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/50"
    >
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#06B6D4] via-[#EC4899] to-[#F97316] rounded-lg blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
            <div className="relative h-9 w-9 rounded-lg bg-[#06B6D4] flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
          </div>
          <span className="text-xl font-bold text-[#06B6D4]">
            Ordo Todo
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link 
            href="/guide" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
          >
            {t('guide')}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#06B6D4] group-hover:w-full transition-all duration-300" />
          </Link>
          <Link 
            href="/blog" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
          >
            {t('blog')}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#EC4899] group-hover:w-full transition-all duration-300" />
          </Link>
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <a href="https://ordotodo.app/login" target="_blank" rel="noreferrer">
            <Button variant="ghost" size="sm" className="text-sm font-medium">
              {t('login')}
            </Button>
          </a>
          <a href="https://ordotodo.app/register" target="_blank" rel="noreferrer">
            <Button 
              size="sm" 
              className="bg-[#06B6D4] hover:bg-[#0891B2] text-white border-0 shadow-lg shadow-[#06B6D4]/25"
            >
              {t('register')}
            </Button>
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-background/95 backdrop-blur-xl border-b"
        >
          <nav className="container flex flex-col gap-4 py-6 px-4">
            <Link 
              href="/guide" 
              className="text-base font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('guide')}
            </Link>
            <Link 
              href="/blog" 
              className="text-base font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('blog')}
            </Link>
            <div className="flex flex-col gap-3 pt-4 border-t">
              <a href="https://ordotodo.app/login" target="_blank" rel="noreferrer">
                <Button variant="outline" className="w-full">{t('login')}</Button>
              </a>
              <a href="https://ordotodo.app/register" target="_blank" rel="noreferrer">
                <Button className="w-full bg-[#06B6D4] hover:bg-[#0891B2] text-white border-0">
                  {t('register')}
                </Button>
              </a>
            </div>
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
}
