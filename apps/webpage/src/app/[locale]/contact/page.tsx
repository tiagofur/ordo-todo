'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Button } from '@ordo-todo/ui';
import { Mail, Send, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const t = useTranslations('Contact');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    setIsSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-background pt-24 pb-16">
      <div className="container px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EC4899] text-white mb-6">
            <Mail className="h-4 w-4" />
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
          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border-2 border-[#10B981] rounded-2xl p-12 text-center"
            >
              <div className="h-20 w-20 rounded-full bg-[#10B981] flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {t('success_title')}
              </h2>
              <p className="text-muted-foreground">
                {t('success_message')}
              </p>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onSubmit={handleSubmit}
              className="bg-card border-2 border-border rounded-2xl p-8 md:p-12"
            >
              <div className="grid gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('name_label')}
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full h-12 px-4 rounded-xl border-2 border-border bg-background focus:border-[#06B6D4] focus:outline-none transition-colors"
                    placeholder={t('name_placeholder')}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('email_label')}
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full h-12 px-4 rounded-xl border-2 border-border bg-background focus:border-[#06B6D4] focus:outline-none transition-colors"
                    placeholder={t('email_placeholder')}
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('subject_label')}
                  </label>
                  <input
                    type="text"
                    name="subject"
                    required
                    className="w-full h-12 px-4 rounded-xl border-2 border-border bg-background focus:border-[#06B6D4] focus:outline-none transition-colors"
                    placeholder={t('subject_placeholder')}
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t('message_label')}
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background focus:border-[#06B6D4] focus:outline-none transition-colors resize-none"
                    placeholder={t('message_placeholder')}
                  />
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 text-lg font-semibold bg-[#06B6D4] hover:bg-[#0891B2] text-white disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t('sending')}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="h-5 w-5" />
                      {t('submit')}
                    </span>
                  )}
                </Button>
              </div>
            </motion.form>
          )}
        </div>
      </div>
    </main>
  );
}
