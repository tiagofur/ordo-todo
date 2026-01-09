import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Button,
} from "@ordo-todo/ui";
import { Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { useGenerateWeeklyReport } from "@/hooks/api";
import { useTranslation } from "react-i18next";

interface GenerateReportDialogProps {
  onSuccess?: (report: any) => void;
  trigger?: React.ReactNode;
}

export function GenerateReportDialog({ onSuccess, trigger }: GenerateReportDialogProps) {
  const { t } = (useTranslation as any)();
  const [open, setOpen] = useState(false);
  const generateReport = useGenerateWeeklyReport();

  const handleGenerate = async () => {
    try {
      const result = await generateReport.mutateAsync(undefined);
      if (onSuccess) {
        onSuccess(result);
      }
      // Keep dialog open to show success message
      setTimeout(() => {
        setOpen(false);
        generateReport.reset();
      }, 2000);
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  const handleClose = () => {
    setOpen(false);
    generateReport.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Sparkles className="h-4 w-4" />
            {t('GenerateReportDialog.trigger')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {t('GenerateReportDialog.title')}
          </DialogTitle>
          <DialogDescription>
            {t('GenerateReportDialog.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!generateReport.isPending && !generateReport.isSuccess && (
            <>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>{t('GenerateReportDialog.includes.title')}</p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{t('GenerateReportDialog.includes.metrics')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{t('GenerateReportDialog.includes.strengths')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{t('GenerateReportDialog.includes.recommendations')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{t('GenerateReportDialog.includes.patterns')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{t('GenerateReportDialog.includes.score')}</span>
                  </li>
                </ul>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handleClose}>
                  {t('GenerateReportDialog.buttons.cancel')}
                </Button>
                <Button onClick={handleGenerate} className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  {t('GenerateReportDialog.buttons.generate')}
                </Button>
              </div>
            </>
          )}

          {generateReport.isPending && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="text-center space-y-2">
                <p className="font-medium">{t('GenerateReportDialog.loading.title')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('GenerateReportDialog.loading.description')}
                </p>
              </div>
            </div>
          )}

          {generateReport.isSuccess && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <div className="text-center space-y-2">
                <p className="font-medium text-green-600">{t('GenerateReportDialog.success.title')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('GenerateReportDialog.success.description')}
                </p>
              </div>
            </div>
          )}

          {generateReport.isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800 p-4">
              <p className="text-sm text-red-800 dark:text-red-200">
                {t('GenerateReportDialog.error')}
              </p>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={handleClose}>
                  {t('GenerateReportDialog.buttons.close')}
                </Button>
                <Button onClick={handleGenerate} variant="destructive" className="gap-2">
                  {t('GenerateReportDialog.buttons.retry')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
