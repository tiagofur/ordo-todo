'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { MessageSquare, ShieldCheck } from 'lucide-react';

export default function SlackGuide() {
  const t = useTranslations('GuideConnectSlack');
  const steps = [1, 2, 3, 4, 5];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-[#4A154B]/20 flex items-center justify-center">
          <MessageSquare className="h-5 w-5 text-[#4A154B] dark:text-[#E01E5A]" />
        </div>
        <span className="text-sm font-medium text-[#4A154B] dark:text-[#E01E5A]">
          {t('badge')}
        </span>
      </div>

      <h1 className="!mt-0">{t('title')}</h1>
      <p className="lead text-xl text-muted-foreground">{t('subtitle')}</p>

      <h2>{t('steps_title')}</h2>
      <div className="not-prose space-y-4 my-6">
        {steps.map((step, index) => (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
            className="flex gap-4 p-4 rounded-xl border bg-card"
          >
            <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 text-white font-bold bg-[#4A154B]">
              {step}
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">
                {t(`steps.${step}.title`)}
              </h4>
              <p className="text-sm text-muted-foreground">
                {t(`steps.${step}.description`)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <h2>{t('permissions_title')}</h2>
      <div className="not-prose p-5 rounded-xl border bg-card my-6">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="h-5 w-5 text-[#10B981]" />
          <h4 className="font-semibold text-foreground">{t('permissions_sub')}</h4>
        </div>
        <p className="text-sm text-muted-foreground">{t('permissions_text')}</p>
      </div>
    </div>
  );
}
