import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Target, Plus, Calendar, TrendingUp } from "lucide-react";
import { PageTransition, SlideIn } from "@/components/motion";
import { Button, cn } from "@ordo-todo/ui";
import { useObjectives } from "@/hooks/api";
// import { CreateObjectiveDialog } from "@/components/goals/create-objective-dialog"; 
import { useNavigate } from "react-router-dom";

export function Goals() {
  const { t } = (useTranslation as any)();
  const navigate = useNavigate();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { data: objectives, isLoading } = useObjectives();

  return (
    <PageTransition>
      <div className="space-y-6">
        <SlideIn direction="top">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                 <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg bg-pink-500 shadow-pink-500/40">
                    <Target className="h-6 w-6" />
                 </div>
                 {t("Goals.title")}
              </h1>
              <p className="text-muted-foreground mt-2">{t("Goals.subtitle")}</p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2 bg-pink-500 hover:bg-pink-600 text-white shadow-pink-500/20 shadow-lg">
              <Plus className="w-4 h-4" />
              {t("Goals.createObjective")}
            </Button>
          </div>
        </SlideIn>

        {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-40 rounded-2xl bg-muted/20 animate-pulse" />
                ))}
            </div>
        ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {objectives?.map((objective, index) => (
                    <SlideIn key={objective.id} delay={index * 0.1}>
                        <div 
                            className="group relative flex flex-col justify-between p-6 rounded-2xl bg-card border border-border/50 hover:border-pink-500/50 hover:shadow-lg hover:shadow-pink-500/5 transition-all duration-300 cursor-pointer h-full"
                            onClick={() => navigate(`/goals/${objective.id}`)}
                        >
                            <div className="space-y-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1.5">
                                        <h3 className="font-semibold text-lg line-clamp-2 leading-tight group-hover:text-pink-500 transition-colors">
                                            {objective.title}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>
                                                {new Date(objective.startDate).toLocaleDateString()} - {new Date(objective.endDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div 
                                        className="h-3 w-3 rounded-full shadow-sm ring-2 ring-background" 
                                        style={{ backgroundColor: objective.color }}
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm items-center">
                                        <span className="text-muted-foreground flex items-center gap-1.5">
                                            <TrendingUp className="w-3.5 h-3.5" />
                                            {t("Goals.averageProgress")}
                                        </span>
                                        <span className="font-bold text-foreground">{Math.round(objective.progress)}%</span>
                                    </div>
                                    <div className="h-2.5 w-full rounded-full bg-muted/50 overflow-hidden ring-1 ring-border/20">
                                        <div 
                                            className="h-full rounded-full transition-all duration-500 ease-out"
                                            style={{ 
                                                width: `${objective.progress}%`,
                                                backgroundColor: objective.color || "#ec4899"
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-muted text-muted-foreground border border-border/50">
                                        {t(`Goals.periods.${objective.period}`) || objective.period}
                                    </span>
                                    <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-muted text-muted-foreground border border-border/50 ml-auto">
                                        {objective.keyResults?.length || 0} Key Results
                                    </span>
                                </div>
                            </div>
                        </div>
                    </SlideIn>
                ))}
                
                {objectives?.length === 0 && (
                     <div className="col-span-full flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border/50 rounded-3xl">
                        <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                            <Target className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{t("Goals.noObjectives")}</h3>
                        <p className="text-muted-foreground max-w-sm mb-6">
                            {t("Goals.noObjectivesDescription")}
                        </p>
                        <Button onClick={() => setShowCreateDialog(true)} variant="outline">
                            {t("Goals.createObjective")}
                        </Button>
                     </div>
                )}
            </div>
        )}

        {/* Create Dialog */}
        {/* <CreateObjectiveDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} /> */}
      </div>
    </PageTransition>
  );
}
