"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  Battery,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  Zap,
} from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from "@ordo-todo/ui";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { PageTransition } from "@/components/motion";

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

export function Wellbeing() {
  const { t } = (useTranslation as any)();
  const accentColor = "#f43f5e"; // Rose
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [burnout, setBurnout] = useState<any | null>(null);
  const [patterns, setPatterns] = useState<any | null>(null);
  const [weekly, setWeekly] = useState<any | null>(null);
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
      const [burnoutRes, patternsRes, weeklyRes] = await Promise.allSettled([
        apiClient.getBurnoutAnalysis(),
        apiClient.getWorkPatterns(),
        apiClient.getWeeklyWellbeingSummary(),
      ]);

      if (burnoutRes.status === "fulfilled") {
          const data = burnoutRes.value;
          setBurnout({
              ...data,
              warnings: (data.riskFactors || []).map((factor: any) => ({
                  message: factor,
                  severity: "MODERATE",
                  recommendation: "Review this factor"
              })),
              aiInsights: data.recommendations?.[0] || ""
          });
      }
      
      if (patternsRes.status === "fulfilled") {
          const data = patternsRes.value;
          setPatterns({
              ...data,
              averageHoursPerDay: data.avgSessionDuration ? (data.avgSessionDuration / 60) : 0,
              nightWorkPercentage: 0,
              weekendWorkPercentage: 0,
              averageBreakMinutes: data.breakFrequency ? 60 / data.breakFrequency : 0
          });
      }

      if (weeklyRes.status === "fulfilled") {
          const data = weeklyRes.value;
          setWeekly({
              ...data,
              highlights: data.insights || [],
              concerns: [],
              recommendations: []
          });
      }
      
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

  const getBatteryIcon = (score: number) => {
    if (score >= 75) return <BatteryFull className="h-8 w-8 text-green-500" />;
    if (score >= 50) return <BatteryMedium className="h-8 w-8 text-yellow-500" />;
    if (score >= 25) return <BatteryLow className="h-8 w-8 text-orange-500" />;
    return <Battery className="h-8 w-8 text-red-500" />;
  };

  if (isLoading) {
    return (
      <PageTransition>
        <div className="space-y-6 max-w-5xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-40 bg-muted/50 rounded-[2.5rem] w-full" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-muted/50 rounded-2xl" />
              ))}
            </div>
            <div className="h-64 bg-muted/50 rounded-2xl" />
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8 max-w-5xl mx-auto pb-10"
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
                {t("Sidebar.wellbeing")}
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

        {/* Energy Level Card - Desktop Exclusive Feature kept */}
        {weekly && (
          <motion.div variants={itemVariants}>
            <Card className="overflow-hidden border border-border/50 shadow-sm hover:shadow-md transition-all">
              <div className="bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-8">
                    <div className="p-6 rounded-3xl bg-background/80 backdrop-blur shadow-sm">
                      {getBatteryIcon(weekly.overallScore)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Nivel de Energía</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-6xl font-black tracking-tight">{weekly.overallScore}</span>
                        <span className="text-3xl text-muted-foreground font-medium">/100</span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-sm font-medium text-muted-foreground">Tendencia</p>
                      <div className="flex items-center gap-2 mt-1 px-4 py-2 bg-background/60 rounded-full border border-border/50">
                        {getTrendIcon(weekly.trend)}
                        <span className="font-bold">
                          {weekly.trend === "IMPROVING" && "Mejorando"}
                          {weekly.trend === "STABLE" && "Estable"}
                          {weekly.trend === "DECLINING" && "Bajando"}
                        </span>
                      </div>
                    </div>
                    {weekly.recommendations?.[0] && (
                      <div className="max-w-xs p-4 rounded-2xl bg-background/60 backdrop-blur border border-border/50 shadow-sm">
                        <p className="text-sm flex items-start gap-3">
                          <Zap className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                          <span className="font-medium">{weekly.recommendations[0]}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Burnout Risk Gauge */}
        {burnout && (
          <motion.div variants={itemVariants}>
            <Card className="overflow-hidden border border-border/50 shadow-sm hover:shadow-md transition-all">
              <div className={cn("h-1.5", getRiskColor(burnout.riskLevel).bg)} />
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xl">
                    <Activity className="h-6 w-6 text-muted-foreground" />
                    Análisis de Riesgo de Burnout
                  </span>
                  <Badge variant="outline" className={cn(
                    getRiskColor(burnout.riskLevel).light,
                    getRiskColor(burnout.riskLevel).text,
                    "border-0 px-3 py-1 text-sm font-semibold"
                  )}>
                    {burnout.riskLevel === "LOW" && "Bajo"}
                    {burnout.riskLevel === "MODERATE" && "Moderado"}
                    {burnout.riskLevel === "HIGH" && "Alto"}
                    {burnout.riskLevel === "CRITICAL" && "Crítico"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8 py-4">
                  {/* Score gauge */}
                  <div className="flex items-center gap-8">
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
                        <span className="text-4xl font-black">{burnout.riskScore}</span>
                        <span className="text-xs font-bold uppercase text-muted-foreground">Riesgo</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-4 text-lg">Factores Detectados</h4>
                      <div className="space-y-3">
                        {(burnout.warnings || []).slice(0, 3).map((warning: any, idx: number) => (
                          <div key={idx} className="flex items-start gap-3 text-sm p-3 rounded-xl bg-muted/30">
                            {warning.severity === "SEVERE" ? (
                              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                            ) : warning.severity === "MODERATE" ? (
                              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                            ) : (
                              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                            )}
                            <span className="text-muted-foreground font-medium">{warning.message}</span>
                          </div>
                        ))}
                        {(!burnout.warnings || burnout.warnings.length === 0) && (
                          <p className="text-sm font-medium text-green-600 bg-green-500/10 p-3 rounded-xl flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            No se detectaron factores de riesgo
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick recommendations */}
                  <div className="bg-muted/20 rounded-2xl p-6 border border-border/50">
                    <h4 className="font-semibold mb-4 flex items-center gap-2 text-lg">
                      <Brain className="h-5 w-5 text-primary" />
                      Sugerencias Inmediatas
                    </h4>
                    {burnout.warnings && burnout.warnings.length > 0 ? (
                      <ul className="space-y-3">
                        {burnout.warnings.slice(0, 3).map((warning: any, idx: number) => (
                          <li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground">
                            <div className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                            <span className="leading-relaxed">{warning.recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground italic p-4 text-center">
                        "El equilibrio es la clave para una vida saludable. ¡Sigue así!"
                      </p>
                    )}
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
                value: `${patterns.averageHoursPerDay?.toFixed(1) || 0}h`,
                label: "Horas/día promedio"
              },
              { 
                icon: Moon, 
                color: "text-purple-500", 
                bg: "bg-purple-500/10",
                value: `${patterns.nightWorkPercentage || 0}%`,
                label: "Trabajo nocturno"
              },
              { 
                icon: Calendar, 
                color: "text-orange-500", 
                bg: "bg-orange-500/10",
                value: `${patterns.weekendWorkPercentage || 0}%`,
                label: "Fines de semana"
              },
              { 
                icon: Coffee, 
                color: "text-green-500", 
                bg: "bg-green-500/10",
                value: `${patterns.averageBreakMinutes?.toFixed(0) || 0}m`,
                label: "Descansos promedio"
              }
            ].map((stat, idx) => (
              <motion.div variants={itemVariants} key={idx}>
                <Card className="p-5 hover:shadow-lg transition-all border-border/50 hover:border-border cursor-default h-full bg-card/50 backdrop-blur group">
                  <div className="flex flex-col gap-4">
                    <div className={cn("p-3 w-fit rounded-xl transition-colors group-hover:bg-opacity-20", stat.bg)}>
                      <stat.icon className={cn("h-6 w-6", stat.color)} />
                    </div>
                    <div>
                      <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                      <p className="text-xs font-semibold text-muted-foreground mt-1 uppercase tracking-wide">{stat.label}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Weekly Summary */}
        {weekly && (
          <motion.div variants={itemVariants}>
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xl">
                    <Sun className="h-6 w-6 text-amber-500" />
                    Resumen Semanal
                  </span>
                  <div className="flex items-center gap-2 bg-muted/40 px-3 py-1 rounded-full border border-border/50">
                    {getTrendIcon(weekly.trend)}
                    <span className="text-sm font-medium text-muted-foreground">
                      {weekly.trend === "IMPROVING" && "Mejorando"}
                      {weekly.trend === "STABLE" && "Estable"}
                      {weekly.trend === "DECLINING" && "Bajando"}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Highlights */}
                  {weekly.highlights?.length > 0 && (
                    <div className="p-5 rounded-2xl bg-green-500/5 border border-green-500/10">
                      <h4 className="font-bold text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5" />
                        Lo positivo
                      </h4>
                      <ul className="space-y-2">
                        {weekly.highlights.map((h: string, idx: number) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                             <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                             {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Concerns */}
                  {weekly.concerns?.length > 0 && (
                    <div className="p-5 rounded-2xl bg-orange-500/5 border border-orange-500/10">
                      <h4 className="font-bold text-orange-600 dark:text-orange-400 mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Áreas de mejora
                      </h4>
                      <ul className="space-y-2">
                        {weekly.concerns.map((c: string, idx: number) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                             <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                             {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                   {(!weekly.concerns || weekly.concerns.length === 0) && weekly.highlights?.length > 0 && (
                        <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-center text-center">
                        <p className="text-sm text-blue-600 font-medium">
                            No hay áreas de preocupación importantes esta semana.
                        </p>
                        </div>
                    )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Empty state */}
        {!burnout && !patterns && !weekly && (
          <motion.div variants={itemVariants}>
            <Card className="p-16 text-center border-dashed border-2">
                <div className="w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart className="h-12 w-12 text-muted-foreground/30" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Sin datos de bienestar</h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Continúa usando Ordo para que podamos analizar tus patrones de trabajo y generar insights valiosos.
                </p>
                <Button onClick={fetchData} variant="outline" size="lg" className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Intentar de nuevo
                </Button>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </PageTransition>
  );
}
