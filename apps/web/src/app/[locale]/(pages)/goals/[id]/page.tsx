"use client";

import { useObjective } from "@/lib/api-hooks";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { Button, Skeleton } from "@ordo-todo/ui";
import { ArrowLeft, Plus } from "lucide-react";
import { AppLayout } from "@/components/shared/app-layout";

export default function ObjectiveDetailPage() {
    const params = useParams();
    const router = useRouter();
    const t = useTranslations("Goals");
    const { data: objective, isLoading } = useObjective(params.id as string);

    if (isLoading) return (
    <AppLayout>
      <div className="p-6">
        <Skeleton className="h-96 w-full max-w-5xl mx-auto rounded-3xl" />
      </div>
    </AppLayout>
  );

    if (!objective) {
        return (
            <AppLayout>
              <div className="flex flex-col items-center justify-center h-full p-6">
                  <h1 className="text-2xl font-bold">Objective not found</h1>
                  <Button onClick={() => router.push('/goals')} className="mt-4" variant="outline">
                      {t("backToList")}
                  </Button>
              </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
          <div className="flex bg-background h-full flex-col max-w-5xl mx-auto w-full transition-all space-y-6">
              <Button
                  variant="ghost"
                  onClick={() => router.push('/goals')}
                  className="w-fit pl-0 hover:bg-transparent hover:text-primary -ml-2"
              >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t("backToList")}
              </Button>

              <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                 <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: objective.color || 'var(--primary)' }}
                      />
                      <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                          {t(`status.${objective.status}`)}
                      </span>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground">{objective.title}</h1>
                    {objective.description && (
                        <p className="text-xl text-muted-foreground mt-4 leading-relaxed max-w-3xl">
                            {objective.description}
                        </p>
                    )}
                 </div>
                 <div className="flex flex-col items-end gap-1 bg-card p-4 rounded-2xl border shadow-sm min-w-[140px]">
                     <div className="text-4xl font-black text-primary">{Math.round(objective.progress)}%</div>
                     <span className="text-xs font-bold text-muted-foreground uppercase">{t("progress")}</span>
                 </div>
              </div>

               {/* Key Results Section */}
               <div className="bg-card border rounded-3xl p-8 shadow-sm">
                  <div className="flex justify-between items-center mb-8">
                      <div>
                          <h2 className="text-2xl font-bold">{t("keyResults.title")}</h2>
                          <p className="text-muted-foreground">{t("subtitle")}</p>
                      </div>
                      <Button variant="outline" className="rounded-full">
                          <Plus className="mr-2 h-4 w-4" />
                          {t("keyResults.add")}
                      </Button>
                  </div>

                  <div className="grid gap-4">
                      {objective.keyResults && objective.keyResults.length > 0 ? (
                          objective.keyResults.map(kr => (
                              <div key={kr.id} className="p-5 bg-background hover:bg-muted/30 transition-colors rounded-2xl border flex flex-col gap-4 group">
                                  <div className="flex justify-between items-start">
                                      <div>
                                          <h4 className="font-semibold text-lg">{kr.title}</h4>
                                          {kr.description && <p className="text-sm text-muted-foreground">{kr.description}</p>}
                                      </div>
                                      <div className="text-right">
                                          <div className="font-mono font-medium">
                                              {kr.currentValue} / {kr.targetValue} <span className="text-muted-foreground text-xs">{kr.unit}</span>
                                          </div>
                                      </div>
                                  </div>

                                 <div className="space-y-1">
                                     <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                                          <div
                                              className="h-full bg-primary transition-all duration-500 ease-out"
                                              style={{ width: `${Math.min(100, Math.max(0, kr.progress))}%` }}
                                          />
                                      </div>
                                      <div className="flex justify-end">
                                          <span className="text-xs text-muted-foreground font-medium">{Math.round(kr.progress)}%</span>
                                      </div>
                                 </div>
                              </div>
                          ))
                      ) : (
                          <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed">
                              <p className="text-muted-foreground">No Key Results found. Add one to start tracking progress.</p>
                          </div>
                      )}
                  </div>
               </div>
          </div>
        </AppLayout>
    );
}
