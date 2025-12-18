'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { motion } from 'framer-motion';
import { Sparkles, Github, Twitter, Linkedin, Mail } from 'lucide-react';

export function Footer() {
  const t = useTranslations('Footer');

  const footerLinks = {
    product: [
      { label: t('guide'), href: '/guide' },
      { label: t('blog'), href: '/blog' },
      { label: t('pricing'), href: 'https://ordotodo.app/pricing', external: true },
    ],
    company: [
      { label: t('about'), href: 'https://ordotodo.app/about', external: true },
      { label: t('contact'), href: 'https://ordotodo.app/contact', external: true },
    ],
    legal: [
      { label: t('privacy'), href: 'https://ordotodo.app/privacy', external: true },
      { label: t('terms'), href: 'https://ordotodo.app/terms', external: true },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: 'https://twitter.com/ordotodo', label: 'Twitter' },
    { icon: Github, href: 'https://github.com/ordotodo', label: 'GitHub' },
    { icon: Linkedin, href: 'https://linkedin.com/company/ordotodo', label: 'LinkedIn' },
  ];

  return (
    <footer className="relative border-t bg-card/50">
      {/* Subtle Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-muted/50 to-transparent pointer-events-none" />
      
      <div className="container relative z-10 px-4 md:px-6 py-16 lg:py-20">
        <div className="grid grid-cols-2 gap-12 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="inline-flex items-center space-x-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-[#06B6D4] rounded-lg blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
                <div className="relative h-10 w-10 rounded-lg bg-[#06B6D4] flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
              </div>
              <span className="text-xl font-bold text-[#06B6D4]">
                Ordo Todo
              </span>
            </Link>
            <p className="mt-4 text-muted-foreground leading-relaxed max-w-xs">
              {t('tagline')}
            </p>
            
            {/* Social Links */}
            <div className="mt-6 flex items-center gap-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">{t('product')}</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  {link.external ? (
                    <a 
                      href={link.href} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link 
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">{t('company')}</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">{t('legal')}</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Ordo Todo. {t('rights')}.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{t('made_with')}</span>
            <span className="text-[#EC4899]">♥</span>
            <span>{t('for_productivity')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
