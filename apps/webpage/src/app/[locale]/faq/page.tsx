'use client';

import { useState, useEffect, Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, Search, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { getFAQs } from '@/lib/api';
import type { FAQ } from '@/lib/api';
import { Link } from '@/i18n/routing';

const CATEGORY_KEYS = ['general', 'features', 'billing', 'agents', 'privacy'] as const;
type CategoryKey = (typeof CATEGORY_KEYS)[number];

const CMS_CATEGORY: Record<CategoryKey, string> = {
  general: 'General',
  features: 'Features',
  billing: 'Billing',
  agents: 'AI Assistants',
  privacy: 'Privacy & Security',
};

const FALLBACK_ITEMS: { key: CategoryKey; pairs: [string, string][] }[] = [
  {
    key: 'billing',
    pairs: [
      ['billing_trial_q', 'billing_trial_a'],
      ['billing_grace_q', 'billing_grace_a'],
      ['billing_live_q', 'billing_live_a'],
    ],
  },
  {
    key: 'agents',
    pairs: [
      ['agents_what_q', 'agents_what_a'],
      ['agents_permissions_q', 'agents_permissions_a'],
      ['agents_own_q', 'agents_own_a'],
    ],
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-5 text-left hover:text-[#06B6D4] transition-colors"
      >
        <span className="font-medium text-foreground">{question}</span>
        <ChevronDown
          className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-muted-foreground leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FAQContent() {
  const t = useTranslations('FAQ');
  const searchParams = useSearchParams();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('general');
  const [searchQuery, setSearchQuery] = useState('');

  const initialQuery = searchParams.get('q') ?? '';

  useEffect(() => {
    loadFAQs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (initialQuery) setSearchQuery(initialQuery);
  }, [initialQuery]);

  const loadFAQs = async () => {
    setIsLoading(true);
    try {
      const data = await getFAQs();
      setFaqs(data);
    } catch (error) {
      console.error('Failed to load FAQs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const categoryLabel = (key: CategoryKey): string => t(`categories.${key}`);

  const matchesSearch = (question: string, answer: string): boolean =>
    searchQuery === '' ||
    question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    answer.toLowerCase().includes(searchQuery.toLowerCase());

  const cmsItems = faqs
    .filter((faq) => faq.category === CMS_CATEGORY[activeCategory])
    .filter((faq) => matchesSearch(faq.question, faq.answer))
    .map((faq) => ({ id: faq.id, question: faq.question, answer: faq.answer }));

  const fallbackPairs =
    FALLBACK_ITEMS.find((item) => item.key === activeCategory)?.pairs ?? [];
  const fallbackItems = fallbackPairs
    .map(([q, a]) => ({
      id: `fallback-${q}`,
      question: t(`fallback.${q}`),
      answer: t(`fallback.${a}`),
    }))
    .filter((item) => matchesSearch(item.question, item.answer));

  const items = [...cmsItems, ...fallbackItems];

  return (
    <main className="min-h-screen bg-background pt-24 pb-16">
      <div className="container px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F97316] text-white mb-6">
            <HelpCircle className="h-4 w-4" />
            <span className="text-sm font-medium">{t('badge')}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 text-foreground">
            {t('title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Search */}
        <div className="max-w-xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              aria-label={t('search_placeholder')}
              placeholder={t('search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-12 pr-4 rounded-xl border-2 border-border bg-card focus:border-[#06B6D4] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {CATEGORY_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                activeCategory === key
                  ? 'bg-[#06B6D4] text-white'
                  : 'bg-card border-2 border-border hover:border-[#06B6D4] text-foreground'
              }`}
            >
              {categoryLabel(key)}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#06B6D4]" />
          </div>
        ) : (
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-card rounded-2xl border-2 border-border p-6 md:p-8">
              {items.length > 0 ? (
                items.map((faq) => (
                  <FAQItem key={faq.id} question={faq.question} answer={faq.answer} />
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  {t('no_results')}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Support CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground mb-4">{t('still_need_help')}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/support"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#06B6D4] text-white font-medium hover:opacity-90 transition-opacity"
            >
              {t('support_cta')}
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#EC4899] text-white font-medium hover:opacity-90 transition-opacity"
            >
              {t('contact_us')}
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

export default function FAQPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background pt-24 pb-16">
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#06B6D4]" />
          </div>
        </main>
      }
    >
      <FAQContent />
    </Suspense>
  );
}
