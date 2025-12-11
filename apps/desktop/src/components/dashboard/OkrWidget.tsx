import { Target, TrendingUp, AlertTriangle, ArrowRight, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useObjectivesDashboardSummary } from "@/hooks/api/use-objectives";
import { cn, Button } from "@ordo-todo/ui";

export function OkrWidget() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: summary, isLoading } = useObjectivesDashboardSummary();

  if (isLoading) {
    return <div className="h-[250px] animate-pulse rounded-3xl bg-muted/10 border border-border/50" />;
  }

  const {
    total = 0,
    averageProgress = 0,
    atRisk = 0,
    objectives = []
  } = summary || {};

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-pink-500/30">
        
      {/* Background Decor */}
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-pink-500/5 blur-3xl transition-all group-hover:bg-pink-500/10" />
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-purple-500/5 blur-3xl transition-all group-hover:bg-purple-500/10" />

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">{t("Goals.title")}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
               <TrendingUp className="h-3 w-3" />
               <span>{t("Goals.averageProgress")}: {Math.round(averageProgress)}%</span>
            </div>
          </div>
        </div>
        <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 rounded-full"
            onClick={() => navigate('/goals')}
        >
            <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Global Progress Bar */}
      <div className="mb-6 space-y-2">
        <div className="flex justify-between text-xs font-medium">
             <span>{t("Goals.total")}: {total}</span>
             {atRisk > 0 && (
                 <span className="flex items-center gap-1 text-red-500">
                     <AlertTriangle className="h-3 w-3" />
                     {atRisk} {t("Goals.okrsAtRisk")}
                 </span>
             )}
        </div>
        <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden">
             <div 
                className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-1000 ease-out"
                style={{ width: `${averageProgress}%` }}
             />
        </div>
      </div>

      {/* Top Objectives List */}
      <div className="space-y-3">
         {objectives.length > 0 ? (
             objectives.slice(0, 3).map(obj => (
                 <div 
                    key={obj.id} 
                    className="flex items-center gap-3 rounded-xl border border-border/30 bg-muted/20 p-3 transition-colors hover:bg-muted/40 cursor-pointer"
                    onClick={() => navigate(`/goals/${obj.id}`)}
                 >
                     <div className="flex-1 space-y-1 min-w-0">
                         <div className="flex justify-between items-center">
                            <span className="text-sm font-medium truncate pr-2">{obj.title}</span>
                            <span className={cn(
                                "text-xs font-bold",
                                obj.progress >= 100 ? "text-green-500" : 
                                obj.progress < 30 ? "text-red-500" : "text-amber-500"
                            )}>{Math.round(obj.progress)}%</span>
                         </div>
                         <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                             <div className="flex items-center gap-1">
                                 <Calendar className="h-3 w-3" />
                                 {obj.daysRemaining} {t("Goals.left")}
                             </div>
                             <span>{obj.keyResultsCount} KRs</span>
                         </div>
                     </div>
                 </div>
             ))
         ) : (
             <div className="text-center py-4 text-xs text-muted-foreground">
                 {t("Goals.noObjectives")}
                 <Button variant="link" size="sm" className="h-auto p-0 ml-1" onClick={() => navigate('/goals')}>
                     {t("Goals.createObjective")}
                 </Button>
             </div>
         )}
      </div>

      {objectives.length > 0 && (
        <Button 
            variant="ghost" 
            className="w-full mt-4 text-xs h-8"
            onClick={() => navigate('/goals')}
        >
            {t("Goals.viewAll")}
        </Button>
      )}

    </div>
  );
}
