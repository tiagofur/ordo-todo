'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Check, Sparkles, Crown, Building2, Zap, Clock, ShieldCheck } from 'lucide-react';
import { Button } from '@ordo-todo/ui';
import { Link } from '@/i18n/routing';
import { appLink } from '@/lib/app-url';
import { PLANS, TRIAL, GRACE_PERIOD_DAYS, formatLimit, type PlanId } from '@/lib/plans';

function assertNever(value: never): never {
  throw new Error(`Unhandled plan: ${String(value)}`);
}

export default function PricingPage() {
  const t = useTranslations('Pricing');

  const trialPlanName = t(`plans.${TRIAL.plan}.name`);
  const trialCardNote = t(TRIAL.requiresCard ? 'trial_card' : 'trial_no_card');

  const priceLabel = (key: PlanId): string => {
    const price = PLANS[key].priceUsd;
    return price === null ? t('custom_price') : `$${price}`;
  };

  const limitRows = (key: PlanId): string[] => {
    const limits = PLANS[key].limits;
    const storage = (value: number | null): string =>
      value === null
        ? t('limits.storage_custom')
        : t('limits.storage', { value: formatLimit(value, 'gb', t('limits.unlimited')) });
    switch (key) {
      case 'free':
        return [
          t('limits.tasks_unlimited'),
          t('limits.projects', { value: limits.projects }),
          t('limits.workspaces', { value: limits.workspaces }),
          storage(limits.storageGb),
        ];
      case 'pro':
        return [
          t('everything_in', { plan: t('plans.free.name') }),
          t('limits.projects_unlimited'),
          t('limits.workspaces', { value: limits.workspaces }),
          storage(limits.storageGb),
        ];
      case 'team':
        return [
          t('everything_in', { plan: t('plans.pro.name') }),
          t('limits.workspaces', { value: limits.workspaces }),
          storage(limits.storageGb),
          t('limits.min_seats', { value: limits.minSeats }),
        ];
      case 'enterprise':
        return [
          t('everything_in', { plan: t('plans.team.name') }),
          storage(limits.storageGb),
        ];
      default:
        return assertNever(key);
    }
  };

  const plans: { key: PlanId; icon: typeof Zap; color: string; period: string | null; popular: boolean; extras: string[] }[] = [
    {
      key: 'free',
      icon: Zap,
      color: '#06B6D4',
      period: t('period_forever'),
      popular: false,
      extras: [
        t('extras.pomodoro'),
        t('extras.basic_analytics'),
        t('extras.mobile'),
      ],
    },
    {
      key: 'pro',
      icon: Sparkles,
      color: '#EC4899',
      period: t('period_month'),
      popular: true,
      extras: [
        t('extras.ai_scheduling'),
        t('extras.advanced_analytics'),
        t('extras.recurring'),
        t('extras.priority_support'),
      ],
    },
    {
      key: 'team',
      icon: Crown,
      color: '#F97316',
      period: t('period_user_month'),
      popular: false,
      extras: [
        t('extras.team_workspaces'),
        t('extras.shared_projects'),
        t('extras.team_analytics'),
        t('extras.admin_controls'),
        t('extras.dedicated_support'),
      ],
    },
    {
      key: 'enterprise',
      icon: Building2,
      color: '#A855F7',
      period: null,
      popular: false,
      extras: [
        t('extras.unlimited_users'),
        t('planned_sso'),
        t('planned_dpa'),
        t('extras.account_manager'),
        t('extras.onboarding'),
      ],
    },
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EC4899] text-white mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">{t('badge')}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 text-foreground">
            {t('title')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-2xl border-2 bg-card p-6 ${
                  plan.popular 
                    ? 'border-[#EC4899] shadow-xl shadow-[#EC4899]/10' 
                    : 'border-border'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full text-xs font-semibold bg-[#EC4899] text-white">
                      {t('most_popular')}
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div 
                    className="h-14 w-14 rounded-xl flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: `${plan.color}20` }}
                  >
                    <Icon className="h-7 w-7" style={{ color: plan.color }} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {t(`plans.${plan.key}.name`)}
                  </h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold" style={{ color: plan.color }}>
                      {priceLabel(plan.key)}
                    </span>
                    {plan.period && (
                      <span className="text-muted-foreground">/{plan.period}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {t(`plans.${plan.key}.description`)}
                  </p>
                </div>

                <ul className="space-y-3 mb-6">
                  {[...limitRows(plan.key), ...plan.extras].map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 shrink-0 mt-0.5" style={{ color: plan.color }} />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.key === 'enterprise' ? (
                  <Link href="/contact" className="w-full">
                    <Button 
                      className="w-full"
                      style={{ 
                        backgroundColor: plan.popular ? plan.color : 'transparent',
                        borderColor: plan.color,
                        color: plan.popular ? 'white' : plan.color,
                      }}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {t(`plans.${plan.key}.cta`)}
                    </Button>
                  </Link>
                ) : (
                  <a 
                    href={appLink("/register")}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full"
                  >
                    <Button 
                      className="w-full"
                      style={{ 
                        backgroundColor: plan.popular ? plan.color : 'transparent',
                        borderColor: plan.color,
                        color: plan.popular ? 'white' : plan.color,
                      }}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {t(`plans.${plan.key}.cta`)}
                    </Button>
                  </a>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* USD note */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          {t('usd_note')}
        </p>

        {/* FAQ Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground mb-4">{t('questions')}</p>
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 text-[#06B6D4] hover:text-[#0891B2] font-medium transition-colors"
          >
            {t('view_faq')}
          </Link>
        </motion.div>

        {/* Beta pricing notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12 p-6 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 max-w-2xl mx-auto"
        >
          <Check className="h-8 w-8 text-[#10B981] mx-auto mb-3" />
          <h3 className="font-bold text-foreground mb-2">{t('guarantee_title')}</h3>
          <p className="text-sm text-muted-foreground">{t('guarantee_text')}</p>
        </motion.div>

        {/* Trial + grace */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-8"
        >
          <div className="p-6 rounded-xl bg-[#06B6D4]/10 border border-[#06B6D4]/20 text-left">
            <Clock className="h-8 w-8 text-[#06B6D4] mb-3" />
            <h3 className="font-bold text-foreground mb-2">
              {t('trial_title', { days: TRIAL.days, plan: trialPlanName })}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('trial_text', { days: TRIAL.days, plan: trialPlanName, card_note: trialCardNote })}
            </p>
          </div>
          <div className="p-6 rounded-xl bg-[#F97316]/10 border border-[#F97316]/20 text-left">
            <ShieldCheck className="h-8 w-8 text-[#F97316] mb-3" />
            <h3 className="font-bold text-foreground mb-2">{t('grace_title')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('grace_text', { days: GRACE_PERIOD_DAYS })}
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
