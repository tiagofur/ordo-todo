'use client';

import { useState, type ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui';
import { Button } from '@/components/ui';
import { Sparkles, Loader2, CheckCircle2 } from 'lucide-react';

interface GenerateReportDialogProps {
  onGenerate?: () => Promise<unknown>;
  onSuccess?: (report: unknown) => void;
  trigger?: ReactNode;
  isPending?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  onReset?: () => void;
  labels?: {
    trigger?: string;
    title?: string;
    description?: string;
    includes?: {
      title?: string;
      metrics?: string;
      strengths?: string;
      recommendations?: string;
      patterns?: string;
      score?: string;
    };
    buttons?: {
      cancel?: string;
      generate?: string;
      close?: string;
      retry?: string;
    };
    loading?: {
      title?: string;
      description?: string;
    };
    success?: {
      title?: string;
      description?: string;
    };
    error?: string;
  };
}

const DEFAULT_LABELS = {
  trigger: 'Generate Report',
  title: 'Generate AI Report',
  description:
    'Our AI will analyze your productivity data and generate a personalized weekly report.',
  includes: {
    title: 'Your report will include:',
    metrics: 'Weekly productivity metrics and trends',
    strengths: 'Your strengths and achievements',
    recommendations: 'Personalized recommendations',
    patterns: 'Work pattern analysis',
    score: 'Focus score and improvement tips',
  },
  buttons: {
    cancel: 'Cancel',
    generate: 'Generate Report',
    close: 'Close',
    retry: 'Try Again',
  },
  loading: {
    title: 'Generating your report...',
    description: 'This may take a few seconds',
  },
  success: {
    title: 'Report Generated!',
    description: 'Your weekly report is ready to view.',
  },
  error: 'Failed to generate report. Please try again.',
};

export function GenerateReportDialog({
  onGenerate,
  onSuccess,
  trigger,
  isPending = false,
  isSuccess = false,
  isError = false,
  onReset,
  labels = {},
}: GenerateReportDialogProps) {
  const t = {
    ...DEFAULT_LABELS,
    ...labels,
    includes: { ...DEFAULT_LABELS.includes, ...labels.includes },
    buttons: { ...DEFAULT_LABELS.buttons, ...labels.buttons },
    loading: { ...DEFAULT_LABELS.loading, ...labels.loading },
    success: { ...DEFAULT_LABELS.success, ...labels.success },
  };

  const [open, setOpen] = useState(false);
  const [internalPending, setInternalPending] = useState(false);
  const [internalSuccess, setInternalSuccess] = useState(false);
  const [internalError, setInternalError] = useState(false);

  // Use external state if provided, otherwise internal
  const loading = isPending || internalPending;
  const success = isSuccess || internalSuccess;
  const error = isError || internalError;

  const handleGenerate = async () => {
    if (!onGenerate) return;
    setInternalPending(true);
    setInternalError(false);
    try {
      const result = await onGenerate();
      setInternalPending(false);
      setInternalSuccess(true);
      onSuccess?.(result);
      setTimeout(() => {
        setOpen(false);
        setInternalSuccess(false);
        onReset?.();
      }, 2000);
    } catch (err) {
      console.error('Failed to generate report:', err);
      setInternalPending(false);
      setInternalError(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setInternalPending(false);
    setInternalSuccess(false);
    setInternalError(false);
    onReset?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Sparkles className="h-4 w-4" />
            {t.trigger}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {t.title}
          </DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!loading && !success && !error && (
            <>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>{t.includes.title}</p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{t.includes.metrics}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{t.includes.strengths}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{t.includes.recommendations}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{t.includes.patterns}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{t.includes.score}</span>
                  </li>
                </ul>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handleClose}>
                  {t.buttons.cancel}
                </Button>
                <Button onClick={handleGenerate} className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  {t.buttons.generate}
                </Button>
              </div>
            </>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="text-center space-y-2">
                <p className="font-medium">{t.loading.title}</p>
                <p className="text-sm text-muted-foreground">
                  {t.loading.description}
                </p>
              </div>
            </div>
          )}

          {success && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <div className="text-center space-y-2">
                <p className="font-medium text-green-600">{t.success.title}</p>
                <p className="text-sm text-muted-foreground">
                  {t.success.description}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800 p-4">
              <p className="text-sm text-red-800 dark:text-red-200">{t.error}</p>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={handleClose}>
                  {t.buttons.close}
                </Button>
                <Button
                  onClick={handleGenerate}
                  variant="destructive"
                  className="gap-2"
                >
                  {t.buttons.retry}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
