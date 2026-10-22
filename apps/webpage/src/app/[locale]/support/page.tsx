'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { useRouter } from '@/i18n/routing';
import {
  LifeBuoy,
  Search,
  BookOpen,
  HelpCircle,
  CreditCard,
  Bot,
  Mail,
  Activity,
} from 'lucide-react';

const TOPICS = [
  { key: 'guide', icon: BookOpen, color: '#06B6D4', href: '/guide' },
  { key: 'faq', icon: HelpCircle, color: '#F97316', href: '/faq' },
  { key: 'billing', icon: CreditCard, color: '#EC4899', href: '/pricing' },
  { key: 'agents', icon: Bot, color: '#A855F7', href: '/guide/connect' },
  { key: 'security', icon: HelpCircle, color: '#10B981', href: '/security' },
  { key: 'apps', icon: BookOpen, color: '#3B82F6', href: '/apps' },
];

export default function SupportPage() {
  const t = useTranslations('SupportPage');
  const router = useRouter();
  const [query, setQuery] = useState('');

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/faq?q=${encodeURIComponent(q)}` : '/faq');
  };

  return (
    <main className="min-h-screen bg-background pt-24 pb-16">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#06B6D4] text-white mb-6">
            <LifeBuoy className="h-4 w-4" />
            <span className="text-sm font-medium">{t('badge')}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 text-foreground">
            {t('title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Search → FAQ */}
        <form onSubmit={onSearch} className="max-w-xl mx-auto mb-16">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('search_placeholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-14 pl-12 pr-4 rounded-xl border-2 border-border bg-card focus:border-[#06B6D4] focus:outline-none transition-colors"
            />
          </div>
        </form>

        {/* Topics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
          {TOPICS.map((topic, index) => {
            const Icon = topic.icon;
            return (
              <motion.div
                key={topic.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <Link
                  href={topic.href}
                  className="group block h-full p-6 rounded-2xl border-2 border-border bg-card hover:shadow-xl transition-all duration-300"
                >
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${topic.color}20` }}
                  >
                    <Icon className="h-6 w-6" style={{ color: topic.color }} />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {t(`topics.${topic.key}.title`)}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(`topics.${topic.key}.description`)}
                  </p>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Status + contact */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="p-6 rounded-xl bg-card border-2 border-border text-left">
            <Activity className="h-8 w-8 text-[#10B981] mb-3" />
            <h3 className="font-bold text-foreground mb-2">{t('status_title')}</h3>
            <p className="text-sm text-muted-foreground">{t('status_text')}</p>
          </div>
          <div className="p-6 rounded-xl bg-[#EC4899]/10 border border-[#EC4899]/20 text-left">
            <Mail className="h-8 w-8 text-[#EC4899] mb-3" />
            <h3 className="font-bold text-foreground mb-2">{t('contact_title')}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t('contact_text')}</p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#EC4899] text-white font-medium hover:opacity-90 transition-opacity"
            >
              {t('contact_cta')}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
