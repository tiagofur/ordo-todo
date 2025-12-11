"use client";

import { useTranslations } from "next-intl";
import { useObjectives } from "@/lib/api-hooks";
import { Plus, Target } from "lucide-react";
import { Button, Skeleton } from "@ordo-todo/ui";
import { useState } from "react";
import { CreateObjectiveDialog } from "@/components/goals/create-objective-dialog";
import { useRouter } from "next/navigation";

export default function GoalsPage() {
  const t = useTranslations("Goals");
  const { data: objectives, isLoading } = useObjectives();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="flex h-full flex-col p-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("listTitle")}</h1>
          <p className="text-muted-foreground mt-2 text-lg">{t("subtitle")}</p>
        </div>
        <Button size="lg" className="shadow-lg hover:shadow-xl transition-all" onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-5 w-5" />
          {t("createObjective")}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      ) : !objectives || objectives.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center min-h-[400px] bg-muted/10 rounded-3xl border-2 border-dashed border-muted mx-auto w-full max-w-3xl py-12">
            <div className="bg-primary/10 p-6 rounded-full mb-6">
                <Target className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight">{t("noObjectives")}</h3>
            <p className="text-muted-foreground mt-3 max-w-md text-lg">{t("noObjectivesDescription")}</p>
            <Button className="mt-8" size="lg" onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-5 w-5" />
              {t("createObjective")}
            </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {objectives.map((objective) => (
            <div 
                key={objective.id} 
                className="p-6 border rounded-xl bg-card hover:shadow-lg transition-all duration-200 cursor-pointer group relative overflow-hidden"
                onClick={() => router.push(`/goals/${objective.id}`)}
            >
                <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: objective.color }}></div>
                <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-xl group-hover:text-primary transition-colors line-clamp-2">{objective.title}</h3>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted uppercase tracking-wider">
                        {t(`status.${objective.status}`)}
                    </span>
                </div>
                
                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t("progress")}</span>
                            <span className="font-medium">{Math.round(objective.progress)}%</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-primary transition-all duration-500" 
                                style={{ width: `${objective.progress}%`, backgroundColor: objective.color }}
                            />
                        </div>
                    </div>
                </div>
            </div>
          ))}
        </div>
      )}
      
      <CreateObjectiveDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
}
