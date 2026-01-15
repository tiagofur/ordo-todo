import { useParams, useNavigate } from "react-router-dom";
import { useObjective } from "@/hooks/api";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Target, Calendar, TrendingUp, Rocket } from "lucide-react";
import { Button, Card, CardContent, cn } from "@ordo-todo/ui";
import { motion } from "framer-motion";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring" as const,
            stiffness: 100,
            damping: 12
        },
    },
};

export function GoalDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = (useTranslation as any)();
    const { data: objective, isLoading } = useObjective(id || "");
    
    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-goals border-t-transparent" />
            </div>
        );
    }

    if (!objective) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-6">
                <div className="h-20 w-20 rounded-3xl bg-muted/20 flex items-center justify-center">
                    <Target className="h-10 w-10 text-muted-foreground/30" />
                </div>
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-foreground">Objective not found</h2>
                    <p className="text-muted-foreground mt-2">The goal you are looking for does not exist or has been removed.</p>
                </div>
                <Button onClick={() => navigate('/goals')} variant="outline" className="rounded-xl">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Goals
                </Button>
            </div>
        );
    }

    const recordColor = objective.color || "#EC4899"; // Pink as fallback

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="h-full flex flex-col space-y-8 p-8 overflow-y-auto bg-background/50"
        >
            {/* Standard Iconic Header */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card p-8 rounded-3xl border border-border/50 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-goals/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                
                <div className="flex items-center gap-6 relative z-10">
                    <div 
                        className="flex h-20 w-20 items-center justify-center rounded-[2rem] text-white shadow-lg shadow-goals/20 shrink-0 rotate-3 group-hover:rotate-0 transition-transform duration-500"
                        style={{ backgroundColor: recordColor }}
                    >
                        <Target className="h-10 w-10" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => navigate('/goals')}
                                className="h-7 px-2 -ml-2 text-muted-foreground hover:text-goals"
                            >
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                {t('Goals.title', 'Goals')}
                            </Button>
                            <span className="text-muted-foreground/30">•</span>
                            <span className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                                objective.status === 'ACTIVE' ? "bg-green-500/10 text-green-600" :
                                objective.status === 'AT_RISK' ? "bg-red-500/10 text-red-600" :
                                "bg-slate-500/10 text-slate-600"
                            )}>
                                {objective.status}
                            </span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-foreground">{objective.title}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                    <Button variant="outline" className="rounded-xl border-border/50 hover:bg-goals/5 hover:text-goals transition-all cursor-not-allowed opacity-50">
                        Edit Goal
                    </Button>
                    <Button className="bg-goals hover:bg-goals/90 text-white rounded-xl shadow-lg shadow-goals/20 transition-all font-bold px-6">
                        Add Key Result
                    </Button>
                </div>
            </motion.div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 {/* Main Content */}
                 <div className="lg:col-span-2 space-y-8">
                      {/* Description & Progress */}
                      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {objective.description && (
                               <Card className="border-border/50 shadow-sm p-6 rounded-2xl md:col-span-2">
                                   <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3">Goal Description</h3>
                                   <p className="text-muted-foreground text-lg leading-relaxed">{objective.description}</p>
                               </Card>
                           )}

                           <Card className="border-border/50 shadow-sm p-6 rounded-2xl flex items-center gap-5 relative overflow-hidden">
                                <div 
                                    className="absolute bottom-0 left-0 h-1 transition-all duration-1000 ease-out" 
                                    style={{ width: `${objective.progress}%`, backgroundColor: recordColor }}
                                />
                                <div className="h-16 w-16 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${recordColor}15` }}>
                                    <span className="text-2xl font-black" style={{ color: recordColor }}>
                                        {Math.round(objective.progress)}%
                                    </span>
                                </div>
                                <div>
                                    <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Overall Progress</h4>
                                    <p className="text-foreground font-bold text-lg mt-0.5">{objective.period}</p>
                                </div>
                           </Card>

                           <Card className="border-border/50 shadow-sm p-6 rounded-2xl flex items-center gap-5">
                                <div className="h-16 w-16 rounded-2xl bg-goals/10 flex items-center justify-center shrink-0">
                                    <Calendar className="h-8 w-8 text-goals" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Timeframe</h4>
                                    <p className="text-foreground font-bold mt-0.5">
                                        {new Date(objective.startDate).toLocaleDateString()} - {new Date(objective.endDate).toLocaleDateString()}
                                    </p>
                                </div>
                           </Card>
                      </motion.div>

                      {/* Key Results */}
                      <motion.div variants={itemVariants} className="space-y-6">
                           <div className="flex items-center justify-between px-2">
                                <h2 className="text-2xl font-black flex items-center gap-3">
                                    <div className="h-3 w-3 rounded-full bg-goals shadow-[0_0_10px_rgba(236,72,153,0.5)]" />
                                    Key Results
                                </h2>
                                <span className="text-xs font-bold bg-muted/50 px-3 py-1 rounded-full border border-border/50 text-muted-foreground uppercase">
                                    {objective.keyResults?.length || 0} Total
                                </span>
                           </div>
                           
                           <div className="grid gap-6">
                               {objective.keyResults?.map((kr, index) => (
                                   <motion.div
                                        key={kr.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + index * 0.05 }}
                                   >
                                       <Card className="border-border/50 shadow-sm transition-all hover:shadow-md group rounded-2xl overflow-hidden">
                                           <CardContent className="p-6">
                                               <div className="flex justify-between items-start mb-6">
                                                   <div>
                                                       <h3 className="font-bold text-xl mb-2 group-hover:text-goals transition-colors">{kr.title}</h3>
                                                       <div className="flex items-center gap-2 text-muted-foreground font-medium">
                                                           <TrendingUp className="h-4 w-4" />
                                                           <span>Current: <span className="text-foreground font-bold">{kr.currentValue}</span> / {kr.targetValue} {kr.unit}</span>
                                                       </div>
                                                   </div>
                                                   <div className="text-right">
                                                       <span className="text-2xl font-black block" style={{ color: kr.progress >= 100 ? '#10b981' : recordColor }}>
                                                           {Math.round(kr.progress)}%
                                                       </span>
                                                       <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none">Complete</span>
                                                   </div>
                                               </div>
                                               <div className="space-y-2">
                                                   <div className="h-3 w-full rounded-full bg-muted overflow-hidden border border-border/10">
                                                        <motion.div 
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${Math.min(100, Math.max(0, kr.progress))}%` }}
                                                            transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                                                            className="h-full bg-goals shadow-[0_0_10px_rgba(236,72,153,0.3)] relative"
                                                        >
                                                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                                                        </motion.div>
                                                   </div>
                                               </div>
                                           </CardContent>
                                       </Card>
                                   </motion.div>
                               ))}
                           </div>

                           {(!objective.keyResults || objective.keyResults.length === 0) && (
                               <div className="text-center py-20 rounded-[2.5rem] border-2 border-dashed border-border/50 text-muted-foreground bg-muted/10">
                                   <div className="h-20 w-20 bg-muted/50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                        <Target className="h-10 w-10 text-muted-foreground/30" />
                                   </div>
                                   <h3 className="text-xl font-bold text-foreground">No Key Results yet</h3>
                                   <p className="max-w-xs mx-auto mt-2">Add your first metric to start tracking progress towards this goal.</p>
                                   <Button className="mt-8 bg-goals hover:bg-goals/90 text-white rounded-xl shadow-lg shadow-goals/20 transition-all font-bold px-8 py-6 h-auto">
                                       Add First Key Result
                                   </Button>
                               </div>
                           )}
                      </motion.div>
                 </div>

                 {/* Sidebar / Context */}
                 <motion.div variants={itemVariants} className="space-y-6">
                      <Card className="border-border/50 bg-card/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-sm">
                          <div className="p-6 border-b border-border/50 bg-muted/20">
                               <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Goal Context</h3>
                          </div>
                          <CardContent className="p-6 space-y-6">
                               <div className="flex items-center gap-4">
                                   <div className="h-12 w-12 rounded-xl bg-goals/10 flex items-center justify-center shrink-0">
                                       <Target className="h-6 w-6 text-goals" />
                                   </div>
                                   <div>
                                       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Goal Type</p>
                                       <p className="text-sm font-bold">Strategic Outcome</p>
                                   </div>
                               </div>

                               <div className="flex items-center gap-4">
                                   <div className="h-12 w-12 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
                                       <TrendingUp className="h-6 w-6 text-violet-500" />
                                   </div>
                                   <div>
                                       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Alignment</p>
                                       <p className="text-sm font-bold">Workspace Growth</p>
                                   </div>
                               </div>

                               <div className="pt-4 mt-4 border-t border-border/50">
                                    <div className="flex -space-x-2 mb-4">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted overflow-hidden flex items-center justify-center">
                                                <Target className="h-4 w-4 text-muted-foreground/40" />
                                            </div>
                                        ))}
                                        <div className="h-8 w-8 rounded-full border-2 border-background bg-goals flex items-center justify-center text-[10px] text-white font-bold">
                                            +5
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        This goal is supported by <span className="text-foreground font-bold">8 linked tasks</span> across 2 projects.
                                    </p>
                               </div>
                          </CardContent>
                      </Card>

                      {/* Productivity Tip */}
                      <Card className="border-pink-200 bg-pink-50/30 rounded-2xl p-6">
                           <div className="flex items-start gap-4">
                                <Rocket className="h-5 w-5 text-pink-500 mt-1" />
                                <div>
                                    <h4 className="text-sm font-bold text-pink-900 mb-1">Focus Tip</h4>
                                    <p className="text-xs text-pink-800 leading-relaxed">
                                        Complete the linked tasks to automatically update the progress of your Key Results.
                                    </p>
                                </div>
                           </div>
                      </Card>
                 </motion.div>
            </div>
        </motion.div>
    );
}

export default GoalDetails;
