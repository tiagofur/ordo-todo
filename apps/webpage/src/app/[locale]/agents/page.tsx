'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { Bot, CheckCircle2, ArrowRight, Wrench, ShieldCheck } from 'lucide-react';

const CLIENTS = [
  { key: 'chatgpt', href: '/guide/connect/chatgpt', color: '#10B981' },
  { key: 'claude', href: '/guide/connect/claude', color: '#F97316' },
  { key: 'hermes', href: '/guide/connect/hermes', color: '#06B6D4' },
  { key: 'openclaw', href: '/guide/connect/openclaw', color: '#A855F7' },
];

const TOOL_GROUPS = [
  { key: 'tasks', color: '#06B6D4' },
  { key: 'projects', color: '#EC4899' },
  { key: 'day', color: '#F97316' },
  { key: 'more', color: '#10B981' },
];

export default function AgentsPage() {
  const t = useTranslations('AgentsPage');

  return (
    <main className="min-h-screen bg-background pt-24 pb-16">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#A855F7] text-white mb-6">
            <Bot className="h-4 w-4" />
            <span className="text-sm font-medium">{t('badge')}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 text-foreground">
            {t('title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* What your assistant can do */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
            <Wrench className="h-6 w-6 text-[#A855F7]" />
            {t('tools_title')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TOOL_GROUPS.map((group, index) => (
              <motion.div
                key={group.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="p-5 rounded-xl border-2 border-border bg-card"
              >
                <h3
                  className="font-semibold mb-2"
                  style={{ color: group.color }}
                >
                  {t(`tools.${group.key}.title`)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(`tools.${group.key}.description`)}
                </p>
              </motion.div>
            ))}
          </div>
          <div className="mt-6 p-5 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-start gap-4">
            <ShieldCheck className="h-6 w-6 text-[#10B981] shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              {t('permissions_note')}
            </p>
          </div>
        </div>

        {/* Pick your assistant */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            {t('clients_title')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CLIENTS.map((client, index) => (
              <motion.div
                key={client.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <Link
                  href={client.href}
                  className="flex items-center gap-4 p-5 rounded-xl border-2 border-border bg-card hover:shadow-lg transition-all duration-300 group h-full"
                >
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${client.color}20` }}
                  >
                    <CheckCircle2 className="h-6 w-6" style={{ color: client.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground">
                      {t(`clients.${client.key}.title`)}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {t(`clients.${client.key}.description`)}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform shrink-0" />
                </Link>
              </motion.div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            {t('directory_note')}
          </p>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <Link
            href="/guide/connect"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#A855F7] text-white text-lg font-semibold hover:opacity-90 transition-opacity"
          >
            {t('cta')}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
