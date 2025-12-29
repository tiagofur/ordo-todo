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
      className="fixed top-0 z-50 w-full bg-background border-b border-border"
    >
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="relative">
            <div className="h-9 w-9 rounded-lg bg-[#06B6D4] flex items-center justify-center shadow-lg shadow-[#06B6D4]/30 group-hover:shadow-[#06B6D4]/50 transition-shadow">
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
            href="/" 
            className="text-sm font-medium text-muted-foreground hover:text-[#06B6D4] transition-colors relative group"
          >
            {t('home')}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#06B6D4] group-hover:w-full transition-all duration-300" />
          </Link>
          <Link 
            href="/guide" 
            className="text-sm font-medium text-muted-foreground hover:text-[#14B8A6] transition-colors relative group"
          >
            {t('guide')}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#14B8A6] group-hover:w-full transition-all duration-300" />
          </Link>
          <Link 
            href="/blog" 
            className="text-sm font-medium text-muted-foreground hover:text-[#EC4899] transition-colors relative group"
          >
            {t('blog')}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#EC4899] group-hover:w-full transition-all duration-300" />
          </Link>
          <Link 
            href="/faq" 
            className="text-sm font-medium text-muted-foreground hover:text-[#F97316] transition-colors relative group"
          >
            {t('faq')}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#F97316] group-hover:w-full transition-all duration-300" />
          </Link>
          <Link 
            href="/changelog" 
            className="text-sm font-medium text-muted-foreground hover:text-[#10B981] transition-colors relative group"
          >
            {t('changelog')}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#10B981] group-hover:w-full transition-all duration-300" />
          </Link>
          <Link 
            href="/roadmap" 
            className="text-sm font-medium text-muted-foreground hover:text-[#8B5CF6] transition-colors relative group"
          >
            {t('roadmap')}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#8B5CF6] group-hover:w-full transition-all duration-300" />
          </Link>
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <a href="https://ordotodo.app/login" target="_blank" rel="noreferrer">
            <Button variant="ghost" size="sm" className="text-sm font-medium hover:text-[#06B6D4]">
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
          className="md:hidden bg-background border-b"
        >
          <nav className="container flex flex-col gap-4 py-6 px-4">
            <Link 
              href="/" 
              className="text-base font-medium py-2 hover:text-[#06B6D4] transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('home')}
            </Link>
            <Link 
              href="/guide" 
              className="text-base font-medium py-2 hover:text-[#14B8A6] transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('guide')}
            </Link>
            <Link 
              href="/blog" 
              className="text-base font-medium py-2 hover:text-[#EC4899] transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('blog')}
            </Link>
            <Link 
              href="/faq" 
              className="text-base font-medium py-2 hover:text-[#F97316] transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('faq')}
            </Link>
            <Link 
              href="/changelog" 
              className="text-base font-medium py-2 hover:text-[#10B981] transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('changelog')}
            </Link>
            <Link 
              href="/roadmap" 
              className="text-base font-medium py-2 hover:text-[#8B5CF6] transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('roadmap')}
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
