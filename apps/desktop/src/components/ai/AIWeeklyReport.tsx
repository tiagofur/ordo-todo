import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  FileText,
  TrendingUp,
  Trophy,
  Target,
  Lightbulb,
  RefreshCw,
  Download,
  Share2,
  ChevronDown,
  ChevronRight,
  Zap,
} from "lucide-react";
import { cn, Button, Card } from "@ordo-todo/ui";

interface ProductivityData {
  totalPomodoros: number;
  totalTasks: number;
  completedTasks: number;
  streak: number;
  avgPomodorosPerDay: number;
  peakHour: number;
  topProject?: { name: string; tasks: number };
  weeklyData: { day: string; pomodoros: number; tasks: number }[];
}

interface AIReportSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: string[];
  type: "success" | "info" | "warning" | "tip";
}

interface AIWeeklyReportProps {
  data?: ProductivityData;
  onRefresh?: () => void;
  className?: string;
}

const MOCK_DATA: ProductivityData = {
  totalPomodoros: 32,
  totalTasks: 45,
  completedTasks: 28,
  streak: 5,
  avgPomodorosPerDay: 4.5,
  peakHour: 10,
  topProject: { name: "Proyecto Alpha", tasks: 12 },
  weeklyData: [
    { day: "Lun", pomodoros: 6, tasks: 5 },
    { day: "Mar", pomodoros: 8, tasks: 7 },
    { day: "Mié", pomodoros: 4, tasks: 3 },
    { day: "Jue", pomodoros: 7, tasks: 6 },
    { day: "Vie", pomodoros: 5, tasks: 4 },
    { day: "Sáb", pomodoros: 2, tasks: 2 },
    { day: "Dom", pomodoros: 0, tasks: 1 },
  ],
};

function generateAIReport(data: ProductivityData, t: (key: string) => string): AIReportSection[] {
  const completionRate = Math.round((data.completedTasks / data.totalTasks) * 100);
  const sections: AIReportSection[] = [];

  // Summary Section
  sections.push({
    id: "summary",
    title: t("ai.sections.summary"),
    icon: <FileText className="h-5 w-5" />,
    type: "info",
    content: [
      `Esta semana completaste ${data.totalPomodoros} pomodoros y ${data.completedTasks} tareas.`,
      `Tu tasa de completitud fue del ${completionRate}%.`,
      `Promedio diario: ${data.avgPomodorosPerDay.toFixed(1)} pomodoros.`,
    ],
  });

  // Achievements Section
  const achievements: string[] = [];
  if (data.streak >= 3) {
    achievements.push(`🔥 ¡Mantuviste una racha de ${data.streak} días consecutivos!`);
  }
  if (completionRate >= 80) {
    achievements.push(`🎯 Excelente tasa de completitud: ${completionRate}%`);
  }
  if (data.totalPomodoros >= 25) {
    achievements.push(`🍅 ¡Superaste los 25 pomodoros semanales!`);
  }
  if (data.topProject) {
    achievements.push(`⭐ Tu proyecto más activo: "${data.topProject.name}" con ${data.topProject.tasks} tareas`);
  }

  if (achievements.length > 0) {
    sections.push({
      id: "achievements",
      title: t("ai.sections.achievements"),
      icon: <Trophy className="h-5 w-5" />,
      type: "success",
      content: achievements,
    });
  }

  // Areas for Improvement
  const improvements: string[] = [];
  if (data.avgPomodorosPerDay < 4) {
    improvements.push(`Intenta aumentar tu promedio diario de ${data.avgPomodorosPerDay.toFixed(1)} a 4 pomodoros.`);
  }
  if (completionRate < 70) {
    improvements.push(`La tasa de completitud (${completionRate}%) puede mejorar. Divide las tareas grandes.`);
  }
  const lowDays = data.weeklyData.filter(d => d.pomodoros < 2);
  if (lowDays.length > 2) {
    improvements.push(`${lowDays.length} días con baja actividad. Establece metas diarias mínimas.`);
  }

  if (improvements.length > 0) {
    sections.push({
      id: "improvements",
      title: t("ai.sections.improvements"),
      icon: <Target className="h-5 w-5" />,
      type: "warning",
      content: improvements,
    });
  }

  // Recommendations
  const recommendations: string[] = [];
  recommendations.push(`Tu hora más productiva es las ${data.peakHour}:00. Agenda tareas importantes ahí.`);
  
  if (data.streak > 0) {
    recommendations.push(`Para mantener tu racha, intenta completar al menos 1 pomodoro cada día.`);
  }
  
  const bestDay = data.weeklyData.reduce((a, b) => a.pomodoros > b.pomodoros ? a : b);
  recommendations.push(`${bestDay.day} fue tu mejor día. Replica esas condiciones.`);
  
  recommendations.push(`Considera tomar descansos de 15 minutos cada 4 pomodoros para mantener la energía.`);

  sections.push({
    id: "recommendations",
    title: t("ai.sections.recommendations"),
    icon: <Lightbulb className="h-5 w-5" />,
    type: "tip",
    content: recommendations,
  });

  return sections;
}

const sectionColors = {
  success: "border-l-emerald-500 bg-emerald-500/5",
  info: "border-l-blue-500 bg-blue-500/5",
  warning: "border-l-amber-500 bg-amber-500/5",
  tip: "border-l-purple-500 bg-purple-500/5",
};

const iconColors = {
  success: "text-emerald-500",
  info: "text-blue-500",
  warning: "text-amber-500",
  tip: "text-purple-500",
};

export function AIWeeklyReport({ data = MOCK_DATA, onRefresh, className }: AIWeeklyReportProps) {
  const { t } = useTranslation();
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<AIReportSection[]>([]);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const sections = generateAIReport(data, t);
    setReport(sections);
    setExpandedSections(sections.map(s => s.id)); // Expand all by default
    setHasGenerated(true);
    setIsGenerating(false);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <Card className={cn("p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <Sparkles className="h-6 w-6 text-purple-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{t("ai.weeklyReport")}</h2>
            <p className="text-sm text-muted-foreground">
              Análisis inteligente de tu productividad
            </p>
          </div>
        </div>
        
        {hasGenerated && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleGenerate}>
              <RefreshCw className={cn("h-4 w-4 mr-2", isGenerating && "animate-spin")} />
              Regenerar
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!hasGenerated ? (
          <motion.div
            key="generate"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center py-12"
          >
            {isGenerating ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="p-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-4"
                >
                  <Zap className="h-8 w-8 text-purple-500" />
                </motion.div>
                <p className="text-lg font-medium mb-2">{t("ai.analyzing")}</p>
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-purple-500"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="p-4 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 mb-4">
                  <TrendingUp className="h-8 w-8 text-purple-500/60" />
                </div>
                <p className="text-muted-foreground mb-4 text-center max-w-md">
                  Genera un reporte inteligente basado en tu actividad de la semana.
                  Incluye resumen, logros, áreas de mejora y recomendaciones personalizadas.
                </p>
                <Button 
                  onClick={handleGenerate}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t("ai.generateReport")}
                </Button>
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="report"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-purple-500">{data.totalPomodoros}</p>
                <p className="text-xs text-muted-foreground">Pomodoros</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-emerald-500">{data.completedTasks}</p>
                <p className="text-xs text-muted-foreground">Tareas</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-amber-500">{data.streak}</p>
                <p className="text-xs text-muted-foreground">Racha 🔥</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-blue-500">{data.avgPomodorosPerDay.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Promedio/día</p>
              </div>
            </div>

            {/* Report Sections */}
            {report.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "border-l-4 rounded-lg overflow-hidden",
                  sectionColors[section.type]
                )}
              >
                <button
                  className="w-full flex items-center justify-between p-4 text-left"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className={iconColors[section.type]}>{section.icon}</span>
                    <h3 className="font-semibold">{section.title}</h3>
                  </div>
                  {expandedSections.includes(section.id) ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>

                <AnimatePresence>
                  {expandedSections.includes(section.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <ul className="px-4 pb-4 space-y-2">
                        {section.content.map((item, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-start gap-2 text-sm"
                          >
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current opacity-50 shrink-0" />
                            <span>{item}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
