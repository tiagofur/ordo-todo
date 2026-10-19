'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { MousePointerClick, Terminal, LifeBuoy, Copy, Check } from 'lucide-react';
import { useState } from 'react';

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="not-prose relative my-4 rounded-xl border bg-zinc-950 overflow-hidden">
      <button
        onClick={copy}
        className="absolute top-3 right-3 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        aria-label="Copy"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-400" />
        ) : (
          <Copy className="h-4 w-4 text-zinc-300" />
        )}
      </button>
      <pre className="p-4 pr-12 overflow-x-auto text-sm text-zinc-100 font-mono whitespace-pre">
        {code}
      </pre>
    </div>
  );
}

export default function ChatGPTGuide() {
  const t = useTranslations('GuideConnectChatGPT');
  const steps = [1, 2, 3, 4];
  const errors = [1, 2, 3];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
          <MousePointerClick className="h-5 w-5 text-[#10B981]" />
        </div>
        <span className="text-sm font-medium text-[#10B981]">{t('badge')}</span>
      </div>

      <h1 className="!mt-0">{t('title')}</h1>
      <p className="lead text-xl text-muted-foreground">{t('subtitle')}</p>

      <h2>{t('oneclick_title')}</h2>
      <p>{t('oneclick_text')}</p>
      <div className="not-prose space-y-4 my-6">
        {steps.map((step, index) => (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
            className="flex gap-4 p-4 rounded-xl border bg-card"
          >
            <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 text-white font-bold bg-[#10B981]">
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

      <h2>{t('manual_title')}</h2>
      <p>{t('manual_text')}</p>
      <div className="flex items-center gap-2 mt-4 mb-2">
        <Terminal className="h-4 w-4 text-[#F97316]" />
        <h4 className="!m-0 font-semibold">{t('config_title')}</h4>
      </div>
      <CodeBlock code={t('config_code')} />
      <p className="text-sm text-muted-foreground">{t('verify_text')}</p>
      <CodeBlock code={t('verify_code')} />

      <h2>{t('trouble_title')}</h2>
      <div className="not-prose space-y-4 my-6">
        {errors.map((n) => (
          <div key={n} className="p-4 rounded-xl border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <LifeBuoy className="h-4 w-4 text-[#F97316]" />
              <h4 className="font-semibold text-foreground">
                {t(`errors.${n}.title`)}
              </h4>
            </div>
            <p className="text-sm text-muted-foreground">
              {t(`errors.${n}.fix`)}
            </p>
          </div>
        ))}
      </div>

      <h2>{t('listing_title')}</h2>
      <div className="not-prose p-5 rounded-xl border bg-card my-6">
        <p className="text-sm text-muted-foreground">{t('listing_text')}</p>
      </div>
    </div>
  );
}
