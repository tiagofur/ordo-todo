import { useParams, useNavigate } from "react-router-dom";
import { useObjective } from "@/hooks/api";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Target, Calendar, TrendingUp } from "lucide-react";
import { Button, Progress, Card, CardHeader, CardTitle, CardContent, cn } from "@ordo-todo/ui";

export function GoalDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = (useTranslation as any)();
    const { data: objective, isLoading } = useObjective(id || "");
    
    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!objective) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-4">
                <Target className="h-12 w-12 text-muted-foreground/50" />
                <h2 className="text-xl font-semibold text-muted-foreground">Objective not found</h2>
                <Button onClick={() => navigate('/goals')}>Back to Goals</Button>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col space-y-8 p-8 overflow-y-auto">
            {/* Header */}
            <div className="flex items-start gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/goals')} className="mt-1">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1 space-y-2">
                     <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">{objective.title}</h1>
                        <span className={cn(
                            "px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider",
                            objective.status === 'ACTIVE' ? "bg-green-500/10 text-green-600" :
                            objective.status === 'AT_RISK' ? "bg-red-500/10 text-red-600" :
                            "bg-slate-500/10 text-slate-600"
                        )}>
                            {objective.status}
                        </span>
                     </div>
                     {objective.description && (
                        <p className="text-muted-foreground text-lg">{objective.description}</p>
                     )}
                     <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                         <div className="flex items-center gap-1.5">
                             <Calendar className="h-4 w-4" />
                             <span>{new Date(objective.startDate).toLocaleDateString()} - {new Date(objective.endDate).toLocaleDateString()}</span>
                         </div>
                         <div className="flex items-center gap-1.5">
                             <TrendingUp className="h-4 w-4" />
                             <span>{objective.period}</span>
                         </div>
                     </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 {/* Main Content */}
                 <div className="lg:col-span-2 space-y-8">
                      {/* Overall Progress */}
                      <Card className="border-border/50 shadow-sm">
                           <CardContent className="p-6 space-y-4">
                               <div className="flex justify-between items-end">
                                   <div className="space-y-1">
                                       <h3 className="text-sm font-medium text-muted-foreground">Overall Progress</h3>
                                       <span className="text-3xl font-bold">{Math.round(objective.progress)}%</span>
                                   </div>
                               </div>
                               <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-1000 ease-out"
                                        style={{ width: `${objective.progress}%` }}
                                    />
                               </div>
                           </CardContent>
                      </Card>

                      {/* Key Results */}
                      <div className="space-y-4">
                           <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">Key Results ({objective.keyResults?.length || 0})</h2>
                           </div>
                           
                           {objective.keyResults?.map(kr => (
                               <Card key={kr.id} className="border-border/50 shadow-sm transition-all hover:border-primary/20">
                                   <CardContent className="p-5 space-y-4">
                                       <div className="flex justify-between items-start">
                                           <div>
                                               <h3 className="font-semibold text-base mb-1">{kr.title}</h3>
                                               <p className="text-sm text-muted-foreground">
                                                   Current: <span className="font-medium text-foreground">{kr.currentValue}</span> / {kr.targetValue} {kr.unit}
                                               </p>
                                           </div>
                                           <span className={cn(
                                               "text-sm font-bold",
                                               kr.progress >= 100 ? "text-green-500" : "text-primary"
                                           )}>
                                               {Math.round(kr.progress)}%
                                           </span>
                                       </div>
                                       <Progress value={kr.progress} className="h-2" />
                                   </CardContent>
                               </Card>
                           ))}

                           {(!objective.keyResults || objective.keyResults.length === 0) && (
                               <div className="text-center py-12 rounded-xl border border-dashed border-border text-muted-foreground">
                                   No Key Results found.
                               </div>
                           )}
                      </div>
                 </div>

                 {/* Sidebar / Context */}
                 <div className="space-y-6">
                      <Card className="border-border/50 bg-muted/20">
                          <CardHeader>
                              <CardTitle className="text-sm font-medium text-muted-foreground">Context</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                               <div className="flex items-center gap-3">
                                   <div className="h-8 w-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
                                       <Target className="h-4 w-4 text-pink-500" />
                                   </div>
                                   <div>
                                       <p className="text-xs text-muted-foreground">Type</p>
                                       <p className="text-sm font-medium">Outcome</p>
                                   </div>
                               </div>
                               {/* Could add owner info, aligned objectives, etc */}
                          </CardContent>
                      </Card>
                 </div>
            </div>
        </div>
    );
}

export default GoalDetails;
