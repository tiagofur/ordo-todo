'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Check, Sparkles, Crown, Building2, Zap } from 'lucide-react';
import { Button } from '@ordo-todo/ui';

export default function PricingPage() {
  const t = useTranslations('Pricing');

  const plans = [
    {
      key: 'free',
      icon: Zap,
      color: '#06B6D4',
      price: '$0',
      period: 'forever',
      popular: false,
      features: [
        'Unlimited tasks',
        '3 projects',
        'Pomodoro timer',
        'Basic analytics',
        'Mobile app access',
        '7-day task history',
      ],
    },
    {
      key: 'pro',
      icon: Sparkles,
      color: '#EC4899',
      price: '$9',
      period: 'month',
      popular: true,
      features: [
        'Everything in Free',
        'Unlimited projects',
        'AI task scheduling',
        'Advanced analytics',
        'Calendar integrations',
        'Recurring tasks',
        'Custom themes',
        'Priority support',
      ],
    },
    {
      key: 'team',
      icon: Crown,
      color: '#F97316',
      price: '$19',
      period: 'user/month',
      popular: false,
      features: [
        'Everything in Pro',
        'Team workspaces',
        'Shared projects',
        'Team analytics',
        'Admin controls',
        'SSO/SAML',
        'API access',
        'Dedicated support',
      ],
    },
    {
      key: 'enterprise',
      icon: Building2,
      color: '#A855F7',
      price: 'Custom',
      period: '',
      popular: false,
      features: [
        'Everything in Team',
        'Unlimited users',
        'Custom integrations',
        'Data residency',
        'SLA guarantee',
        'Dedicated account manager',
        'Custom onboarding',
        'White-label options',
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
                      {plan.price}
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
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 shrink-0 mt-0.5" style={{ color: plan.color }} />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <a 
                  href={plan.key === 'enterprise' ? '/contact' : 'https://ordotodo.app/register'}
                  target={plan.key === 'enterprise' ? undefined : '_blank'}
                  rel={plan.key === 'enterprise' ? undefined : 'noreferrer'}
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
              </motion.div>
            );
          })}
        </div>

        {/* FAQ Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground mb-4">{t('questions')}</p>
          <a
            href="/faq"
            className="inline-flex items-center gap-2 text-[#06B6D4] hover:text-[#0891B2] font-medium transition-colors"
          >
            {t('view_faq')}
          </a>
        </motion.div>

        {/* Money Back Guarantee */}
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
      </div>
    </main>
  );
}
