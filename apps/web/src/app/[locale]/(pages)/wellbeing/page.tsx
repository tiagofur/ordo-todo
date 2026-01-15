"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  TrendingUp,
  TrendingDown,
  Minus,
  Moon,
  Sun,
  Coffee,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  Activity,
  Brain,
  Sparkles,
  RefreshCw,
  Zap,
} from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@ordo-todo/ui";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { AppLayout } from "@/components/shared/app-layout";

interface BurnoutAnalysis {
  riskScore: number;
  riskLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  warnings: {
    type: string;
    severity: "MILD" | "MODERATE" | "SEVERE";
    message: string;
    recommendation: string;
  }[];
  aiInsights?: string;
  patterns: any;
}

interface WorkPattern {
  averageHoursPerDay: number;
  nightWorkPercentage: number;
  weekendWorkPercentage: number;
  longSessionsCount: number;
  averageBreakMinutes: number;
  consistencyScore: number;
}

interface WeeklySummary {
  overallScore: number;
  trend: "IMPROVING" | "STABLE" | "DECLINING";
  highlights: string[];
  concerns: string[];
  recommendations: string[];
}

export default function WellbeingPage() {
  const accentColor = "#f43f5e"; // Rose
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [burnout, setBurnout] = useState<BurnoutAnalysis | null>(null);
  const [patterns, setPatterns] = useState<WorkPattern | null>(null);
  const [weekly, setWeekly] = useState<WeeklySummary | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  // Animation variants
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

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      const [burnoutRes, patternsRes, weeklyRes, recsRes] = await Promise.allSettled([
        apiClient.getBurnoutAnalysis(),
        apiClient.getWorkPatterns(),
        apiClient.getWeeklyWellbeingSummary(),
        apiClient.getRestRecommendations(),
      ]);

      if (burnoutRes.status === "fulfilled") setBurnout(burnoutRes.value);
      if (patternsRes.status === "fulfilled") setPatterns(patternsRes.value);
      if (weeklyRes.status === "fulfilled") setWeekly(weeklyRes.value);
      if (recsRes.status === "fulfilled") setRecommendations(Array.isArray(recsRes.value) ? recsRes.value : []);
    } catch (error) {
      console.error("Failed to fetch wellbeing data:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getRiskColor = (level: string) => {
    switch (level) {
      case "LOW": return { bg: "bg-green-500", text: "text-green-500", light: "bg-green-500/10" };
      case "MODERATE": return { bg: "bg-yellow-500", text: "text-yellow-500", light: "bg-yellow-500/10" };
      case "HIGH": return { bg: "bg-orange-500", text: "text-orange-500", light: "bg-orange-500/10" };
      case "CRITICAL": return { bg: "bg-red-500", text: "text-red-500", light: "bg-red-500/10" };
      default: return { bg: "bg-blue-500", text: "text-blue-500", light: "bg-blue-500/10" };
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "IMPROVING": return <TrendingUp className="h-5 w-5 text-green-500" />;
      case "DECLINING": return <TrendingDown className="h-5 w-5 text-red-500" />;
      default: return <Minus className="h-5 w-5 text-yellow-500" />;
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="animate-pulse space-y-6">
            <div className="h-40 bg-muted/50 rounded-[2.5rem] w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-muted/50 rounded-2xl" />
              ))}
            </div>
            <div className="h-72 bg-muted/50 rounded-2xl" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto space-y-8 pb-10"
      >
        {/* Premium Header */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-card p-8 rounded-[2.5rem] border border-border/50 shadow-sm relative overflow-hidden group"
        >
          {/* Decorative Elements */}
          <div 
            className="absolute -right-20 -top-20 w-64 h-64 rounded-full opacity-10 blur-3xl transition-transform duration-500 group-hover:scale-110"
            style={{ backgroundColor: accentColor }} 
          />
          <div 
            className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full opacity-10 blur-2xl transition-transform duration-500 group-hover:scale-110"
            style={{ backgroundColor: accentColor }} 
          />

          <div className="flex items-center gap-6 relative z-10">
            <div 
              className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:rotate-6"
              style={{ 
                backgroundColor: accentColor,
                boxShadow: `0 8px 30px -4px ${accentColor}50`
              }}
            >
              <Heart className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-1">
              <h1 className="text-4xl font-black tracking-tight text-foreground">
                Bienestar
              </h1>
              <p className="text-lg text-muted-foreground font-medium max-w-lg">
                Mantén el equilibrio entre tu productividad y tu salud mental
              </p>
            </div>
          </div>
          
          <Button
            size="lg"
            onClick={fetchData}
            disabled={isRefreshing}
            className="relative z-10 gap-2 shadow-lg hover:shadow-xl transition-all rounded-xl"
            style={{ 
              backgroundColor: accentColor, 
              color: 'white',
              boxShadow: `0 4px 20px -4px ${accentColor}40`
            }}
          >
            <RefreshCw className={cn("h-5 w-5", isRefreshing && "animate-spin")} />
            Actualizar
          </Button>
        </motion.div>

        {/* Burnout Risk Gauge */}
        {burnout && (
          <motion.div variants={itemVariants}>
            <Card className="overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
              <div className={cn("h-1.5 w-full", getRiskColor(burnout.riskLevel).bg)} />
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xl">
                    <Activity className="h-6 w-6 text-muted-foreground" />
                    Riesgo de Burnout
                  </span>
                  <span className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide",
                    getRiskColor(burnout.riskLevel).light,
                    getRiskColor(burnout.riskLevel).text
                  )}>
                    {burnout.riskLevel === "LOW" && "BAJO"}
                    {burnout.riskLevel === "MODERATE" && "MODERADO"}
                    {burnout.riskLevel === "HIGH" && "ALTO"}
                    {burnout.riskLevel === "CRITICAL" && "CRÍTICO"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-[auto_1fr] gap-10 items-center">
                  {/* Score gauge */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative w-40 h-40">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          className="text-muted/20"
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={`${(burnout.riskScore / 100) * 440} 440`}
                          strokeLinecap="round"
                          className={cn("transition-all duration-1000 ease-out", getRiskColor(burnout.riskLevel).text)}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-extrabold">{burnout.riskScore}</span>
                        <span className="text-xs font-medium text-muted-foreground uppercase">Score</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Factores Detectados
                      </h4>
                      <div className="space-y-3">
                        {burnout.warnings?.slice(0, 3).map((warning, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-muted/40">
                            {warning.severity === "SEVERE" ? (
                              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                            ) : warning.severity === "MODERATE" ? (
                              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                            ) : (
                              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                            )}
                            <div>
                                <span className="text-sm font-medium block">{warning.message}</span>
                                <span className="text-xs text-muted-foreground">{warning.recommendation}</span>
                            </div>
                          </div>
                        ))}
                         {(!burnout.warnings || burnout.warnings.length === 0) && (
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 text-green-600">
                                <CheckCircle2 className="h-5 w-5" />
                                <span className="text-sm font-medium">¡Todo se ve excelente! Sigue así.</span>
                            </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Work Patterns */}
        {patterns && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { 
                icon: Clock, 
                color: "text-blue-500", 
                bg: "bg-blue-500/10",
                value: `${(patterns.averageHoursPerDay ?? 0).toFixed(1)}h`,
                label: "Horas/día"
              },
              { 
                icon: Moon, 
                color: "text-purple-500", 
                bg: "bg-purple-500/10",
                value: `${patterns.nightWorkPercentage ?? 0}%`,
                label: "Trabajo nocturno"
              },
              { 
                icon: Calendar, 
                color: "text-orange-500", 
                bg: "bg-orange-500/10",
                value: `${patterns.weekendWorkPercentage ?? 0}%`,
                label: "Fines de semana"
              },
              { 
                icon: Coffee, 
                color: "text-green-500", 
                bg: "bg-green-500/10",
                value: `${patterns.averageBreakMinutes ?? 0}m`,
                label: "Descansos"
              }
            ].map((stat, idx) => (
              <motion.div variants={itemVariants} key={idx}>
                <Card className="p-4 h-full border-border/50 hover:shadow-md transition-all hover:border-border cursor-default group">
                  <div className="flex flex-col gap-4">
                    <div className={cn("p-3 w-fit rounded-xl transition-colors group-hover:bg-opacity-20", stat.bg)}>
                      <stat.icon className={cn("h-6 w-6", stat.color)} />
                    </div>
                    <div>
                      <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                      <p className="text-sm font-medium text-muted-foreground mt-1">{stat.label}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
            {/* Weekly Summary */}
            {weekly && (
            <motion.div variants={itemVariants} className="lg:col-span-2">
                <Card className="h-full border-border/50 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <Sun className="h-6 w-6 text-yellow-500" />
                        Resumen Semanal
                    </span>
                    <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full">
                        {getTrendIcon(weekly.trend)}
                        <span className="text-sm font-medium">
                        {weekly.trend === "IMPROVING" && "Mejorando"}
                        {weekly.trend === "STABLE" && "Estable"}
                        {weekly.trend === "DECLINING" && "Bajando"}
                        </span>
                    </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Score */}
                    <div className="flex items-center gap-6 p-6 rounded-2xl bg-muted/20 border border-border/50">
                    <div className="text-5xl font-black">{weekly.overallScore}</div>
                    <div className="flex-1 space-y-2">
                        <div className="flex justify-between text-xs font-semibold uppercase text-muted-foreground">
                            <span>Energía</span>
                            <span>{weekly.overallScore}%</span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${weekly.overallScore}%` }}
                        />
                        </div>
                    </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        {/* Highlights */}
                        {weekly.highlights.length > 0 && (
                            <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10">
                            <h4 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                Lo positivo
                            </h4>
                            <ul className="space-y-2">
                                {weekly.highlights.map((h, idx) => (
                                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="mt-1.5 w-1 h-1 rounded-full bg-green-500 flex-shrink-0" />
                                    {h}
                                </li>
                                ))}
                            </ul>
                            </div>
                        )}

                        {/* Concerns */}
                        {weekly.concerns.length > 0 && (
                            <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
                            <h4 className="font-semibold text-orange-600 mb-3 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                Áreas de mejora
                            </h4>
                            <ul className="space-y-2">
                                {weekly.concerns.map((c, idx) => (
                                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="mt-1.5 w-1 h-1 rounded-full bg-orange-500 flex-shrink-0" />
                                    {c}
                                </li>
                                ))}
                            </ul>
                            </div>
                        )}
                        {weekly.concerns.length === 0 && weekly.highlights.length > 0 && (
                             <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-center text-center">
                                <p className="text-sm text-blue-600 font-medium">
                                    No hay áreas de preocupación importantes esta semana. ¡Excelente equilibrio!
                                </p>
                             </div>
                        )}
                    </div>
                </CardContent>
                </Card>
            </motion.div>
            )}

            {/* Rest Recommendations */}
            <motion.div variants={itemVariants}>
                <Card className="h-full border-border/50 shadow-sm">
                    <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-6 w-6 text-amber-500" />
                        Recomendaciones
                    </CardTitle>
                    </CardHeader>
                    <CardContent>
                    <div className="grid gap-4">
                        {recommendations.length > 0 ? recommendations.slice(0, 4).map((rec, idx) => (
                        <div
                            key={idx}
                            className="flex flex-col gap-2 p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50"
                        >
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-full bg-background shadow-sm text-primary mt-1">
                                    <Sparkles className="h-4 w-4" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold">{rec.message}</p>
                                    {rec.suggestedAction && (
                                        <p className="text-xs text-muted-foreground bg-background/50 p-2 rounded-lg mt-2 inline-block">
                                            💡 {rec.suggestedAction}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                        )) : (
                            <div className="text-center py-10 text-muted-foreground">
                                <Coffee className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                <p>No hay recomendaciones por ahora</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
            </motion.div>
        
        </div>

        {/* Empty state */}
        {!burnout && !patterns && !weekly && (
          <motion.div variants={itemVariants}>
            <Card className="p-16 text-center border-dashed border-2">
                <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Tu panel de Bienestar está vacío</h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Continúa usando Ordo para gestionar tus tareas y tiempo. Pronto generaremos insights personalizados sobre tu salud laboral.
                </p>
                <Button onClick={fetchData} size="lg" className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Generar Análisis
                </Button>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </AppLayout>
  );
}
