'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Activity, CheckCircle2, AlertTriangle, XCircle, HelpCircle, Loader2, Database, Zap, Cpu } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { getHealth, type HealthCheck } from '@/lib/api';

type DisplayState = 'loading' | 'operational' | 'degraded' | 'down' | 'unknown';

const STATE_STYLE: Record<Exclude<DisplayState, 'loading'>, { icon: typeof CheckCircle2; color: string; bg: string }> = {
  operational: { icon: CheckCircle2, color: '#10B981', bg: 'bg-[#10B981]/10 border-[#10B981]/20' },
  degraded: { icon: AlertTriangle, color: '#F59E0B', bg: 'bg-[#F59E0B]/10 border-[#F59E0B]/20' },
  down: { icon: XCircle, color: '#EF4444', bg: 'bg-[#EF4444]/10 border-[#EF4444]/20' },
  unknown: { icon: HelpCircle, color: '#6B7280', bg: 'bg-muted border-border' },
};

export default function StatusPage() {
  const t = useTranslations('StatusPage');
  const [state, setState] = useState<DisplayState>('loading');
  const [health, setHealth] = useState<HealthCheck | null>(null);

  const loadHealth = async (isCancelled?: () => boolean) => {
    setState('loading');
    const data = await getHealth();
    if (isCancelled?.()) return;
    if (!data) {
      setState('unknown');
      return;
    }
    setHealth(data);
    if (data.status === 'healthy') setState('operational');
    else if (data.status === 'degraded') setState('degraded');
    else setState('down');
  };

  useEffect(() => {
    let cancelled = false;
    loadHealth(() => cancelled);
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const components = health
    ? [
        { key: 'api', up: true },
        { key: 'database', up: health.checks.database.status === 'up' },
        { key: 'redis', up: health.checks.redis.status === 'up' },
        { key: 'memory', up: health.checks.memory.status === 'up' },
      ]
    : [];

  return (
    <main className="min-h-screen bg-background pt-24 pb-16">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#10B981] text-white mb-6">
            <Activity className="h-4 w-4" />
            <span className="text-sm font-medium">{t('badge')}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 text-foreground">
            {t('title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          {state === 'loading' ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#06B6D4]" />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border-2 p-8 text-center mb-8 ${STATE_STYLE[state].bg}`}
            >
              {(() => {
                const Icon = STATE_STYLE[state].icon;
                return <Icon className="h-12 w-12 mx-auto mb-4" style={{ color: STATE_STYLE[state].color }} />;
              })()}
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {t(`states.${state}.title`)}
              </h2>
              <p className="text-muted-foreground">
                {t(`states.${state}.description`)}
              </p>
              {health && state !== 'unknown' && (
                <p className="text-xs text-muted-foreground mt-4">
                  {t('checked_at')}: {new Date(health.timestamp).toLocaleString()}
                </p>
              )}
              <button
                onClick={() => loadHealth()}
                className="mt-6 inline-flex items-center gap-2 px-6 py-2 rounded-full border-2 border-border bg-card text-sm font-medium text-foreground hover:border-[#06B6D4] transition-colors"
              >
                {t('retry')}
              </button>
            </motion.div>
          )}

          {components.length > 0 && (
            <div className="bg-card rounded-2xl border-2 border-border p-6 md:p-8 mb-8">
              <h3 className="font-bold text-foreground mb-4">{t('components_title')}</h3>
              <div className="space-y-3">
                {components.map((c) => (
                  <div key={c.key} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                    <span className="flex items-center gap-3 text-foreground">
                      {c.key === 'api' && <Activity className="h-4 w-4 text-muted-foreground" />}
                      {c.key === 'database' && <Database className="h-4 w-4 text-muted-foreground" />}
                      {c.key === 'redis' && <Zap className="h-4 w-4 text-muted-foreground" />}
                      {c.key === 'memory' && <Cpu className="h-4 w-4 text-muted-foreground" />}
                      {t(`components.${c.key}`)}
                    </span>
                    <span
                      className="inline-flex items-center gap-2 text-sm font-medium"
                      style={{ color: c.up ? '#10B981' : '#EF4444' }}
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: c.up ? '#10B981' : '#EF4444' }}
                      />
                      {c.up ? t('up') : t('down')}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4 flex items-center gap-2">
                <Cpu className="h-3 w-3" />
                {t('note')}
              </p>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <p className="text-muted-foreground mb-4">{t('changelog_text')}</p>
            <Link
              href="/changelog"
              className="inline-flex items-center gap-2 text-[#06B6D4] hover:text-[#0891B2] font-medium transition-colors"
            >
              {t('changelog_link')}
            </Link>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
