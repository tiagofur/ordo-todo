import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useThemeColors } from "@/app/data/hooks/use-theme-colors.hook";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { useWeeklyMetrics, useGenerateWeeklyReport } from "@/lib/shared-hooks";
import { useDashboardStats } from "@/lib/shared-hooks";
import { format, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";

const screenWidth = Dimensions.get("window").width;

export interface ProductivityData {
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
  icon: any;
  content: string[];
  type: "success" | "info" | "warning" | "tip";
}

interface AIWeeklyReportProps {
  onRefresh?: () => void;
  onGenerateReport?: (data: ProductivityData) => Promise<AIReportSection[]>;
  labels?: {
    title?: string;
    subtitle?: string;
    generate?: string;
    analyzing?: string;
    regenerate?: string;
    export?: string;
    emptyState?: string;
    stats?: {
      pomodoros?: string;
      tasks?: string;
      streak?: string;
      average?: string;
    };
  };
}

const sectionColors: Record<
  AIReportSection["type"],
  { bg: string; border: string; icon: string }
> = {
  success: {
    bg: "rgba(16, 185, 129, 0.1)",
    border: "#10B981",
    icon: "#10B981",
  },
  info: {
    bg: "rgba(59, 130, 246, 0.1)",
    border: "#3B82F6",
    icon: "#3B82F6",
  },
  warning: {
    bg: "rgba(245, 158, 91, 0.1)",
    border: "#F59E0B",
    icon: "#F59E0B",
  },
  tip: {
    bg: "rgba(168, 85, 247, 0.1)",
    border: "#A855F7",
    icon: "#A855F7",
  },
};

export function AIWeeklyReport({
  onRefresh,
  onGenerateReport,
  labels,
}: AIWeeklyReportProps) {
  const colors = useThemeColors();
  const [isGenerating, setIsGenerating] = useState(false);
  const [sections, setSections] = useState<AIReportSection[]>([]);

  const { data: weeklyMetrics, isLoading: weeklyLoading } = useWeeklyMetrics();
  const { data: dashboardStats, isLoading: statsLoading } = useDashboardStats();
  const generateReport = useGenerateWeeklyReport();

  const defaultLabels = {
    title: "AI Weekly Report",
    subtitle: "Smart productivity analysis",
    generate: "Generate Report",
    analyzing: "Analyzing your week...",
    regenerate: "Regenerate",
    export: "Export PDF",
    emptyState: "No data available",
    stats: {
      pomodoros: "Total Pomodoros",
      tasks: "Tasks Completed",
      streak: "Current Streak",
      average: "Average/Day",
    },
  };

  const t = { ...defaultLabels, ...labels };

  const productivityData = useMemo((): ProductivityData => {
    const weekData =
      weeklyMetrics?.map((m) => ({
        day: format(new Date(m.date), "EEE", { locale: es }),
        pomodoros: Math.floor((m.minutesWorked || 0) / 25),
        tasks: m.tasksCompleted || 0,
      })) || [];

    const totalPomodoros = weekData.reduce((sum, d) => sum + d.pomodoros, 0);
    const completedTasks = weekData.reduce((sum, d) => sum + d.tasks, 0);

    return {
      totalPomodoros,
      totalTasks: completedTasks,
      completedTasks,
      streak: dashboardStats?.streak || 0,
      avgPomodorosPerDay: totalPomodoros > 0 ? totalPomodoros / 7 : 0,
      peakHour: 10,
      weeklyData: weekData,
    };
  }, [weeklyMetrics, dashboardStats]);

  const isLoading = weeklyLoading || statsLoading;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      if (onGenerateReport) {
        const aiSections = await onGenerateReport(productivityData);
        setSections(aiSections);
      } else {
        await generateReport.mutateAsync();
        const mockSections: AIReportSection[] = [
          {
            id: "summary",
            title: "Resumen Semanal",
            icon: Feather,
            type: "info",
            content: [
              `Completaste ${productivityData.totalPomodoros} pomodoros esta semana`,
              `Finalizaste ${productivityData.completedTasks} tareas`,
              `Racha actual: ${productivityData.streak} días`,
            ],
          },
          {
            id: "strengths",
            title: "Fortalezas",
            icon: Feather,
            type: "success",
            content: [
              "Mantienes una racha consistente de productividad",
              "Tasa de finalización de tareas mejorando",
            ],
          },
          {
            id: "recommendations",
            title: "Recomendaciones",
            icon: Feather,
            type: "tip",
            content: [
              "Intenta realizar 4 pomodoros diarios para mantener el ritmo",
              "Reserva bloques de tiempo en la mañana para tareas difíciles",
            ],
          },
        ];
        setSections(mockSections);
      }
    } catch (error) {
      console.error("Error generating AI report:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getChartConfig = () => {
    return {
      color: (opacity = 1) => colors.primary,
      strokeWidth: 2,
    };
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t.title}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            {t.subtitle}
          </Text>
        </View>
        {onRefresh && (
          <TouchableOpacity
            style={[styles.refreshButton, { backgroundColor: colors.surface }]}
            onPress={onRefresh}
          >
            <Feather name="refresh-cw" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>
              Cargando datos...
            </Text>
          </View>
        ) : (
          <>
            {/* Stats Cards */}
            <View style={styles.statsContainer}>
              <View
                style={[styles.statCard, { backgroundColor: colors.surface }]}
              >
                <Feather name="clock" size={24} color={colors.primary} />
                <View style={styles.statContent}>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                    {t.stats.pomodoros}
                  </Text>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {productivityData.totalPomodoros}
                  </Text>
                </View>
              </View>

              <View
                style={[styles.statCard, { backgroundColor: colors.surface }]}
              >
                <Feather name="check-circle" size={24} color="#10B981" />
                <View style={styles.statContent}>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                    {t.stats.tasks}
                  </Text>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {productivityData.completedTasks}
                  </Text>
                </View>
              </View>

              <View
                style={[styles.statCard, { backgroundColor: colors.surface }]}
              >
                <Feather name="zap" size={24} color="#F59E0B" />
                <View style={styles.statContent}>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                    {t.stats.streak}
                  </Text>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {productivityData.streak} días
                  </Text>
                </View>
              </View>

              <View
                style={[styles.statCard, { backgroundColor: colors.surface }]}
              >
                <Feather name="trending-up" size={24} color="#3B82F6" />
                <View style={styles.statContent}>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                    {t.stats.average}
                  </Text>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {productivityData.avgPomodorosPerDay.toFixed(1)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Weekly Chart */}
            {productivityData.weeklyData.length > 0 && (
              <View
                style={[
                  styles.chartContainer,
                  { backgroundColor: colors.surface },
                ]}
              >
                <Text style={[styles.chartTitle, { color: colors.text }]}>
                  Productividad Semanal
                </Text>
                <LineChart
                  data={{
                    labels: productivityData.weeklyData.map((d) => d.day),
                    datasets: [
                      {
                        data: productivityData.weeklyData.map(
                          (d) => d.pomodoros,
                        ),
                        color: colors.primary,
                      },
                    ],
                  }}
                  width={screenWidth - 64}
                  height={200}
                  chartConfig={getChartConfig()}
                  bezier
                  style={styles.chart}
                />
              </View>
            )}

            {/* Generate Report Button */}
            <TouchableOpacity
              style={[
                styles.generateButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Feather name="cpu" size={20} color="#FFFFFF" />
                  <Text style={styles.generateButtonText}>
                    {sections.length > 0 ? t.regenerate : t.generate}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* AI Report Sections */}
            {isGenerating && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={colors.primary} size="large" />
                <Text style={[styles.loadingText, { color: colors.textMuted }]}>
                  {t.analyzing}
                </Text>
              </View>
            )}

            {!isGenerating && sections.length === 0 && (
              <View style={styles.emptyContainer}>
                <Feather
                  name="cpu"
                  size={48}
                  color={colors.textMuted}
                  style={styles.emptyIcon}
                />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  {t.emptyState}
                </Text>
                <Text
                  style={[styles.emptySubtitle, { color: colors.textMuted }]}
                >
                  Toca "Generate Report" para análisis AI
                </Text>
              </View>
            )}

            {!isGenerating &&
              sections.map((section) => (
                <View
                  key={section.id}
                  style={[
                    styles.sectionCard,
                    {
                      backgroundColor: sectionColors[section.type].bg,
                      borderColor: sectionColors[section.type].border,
                    },
                  ]}
                >
                  <View style={styles.sectionHeader}>
                    <View
                      style={[
                        styles.sectionIcon,
                        {
                          backgroundColor: sectionColors[section.type].bg,
                        },
                      ]}
                    >
                      <Feather
                        name="cpu"
                        size={18}
                        color={sectionColors[section.type].icon}
                      />
                    </View>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      {section.title}
                    </Text>
                  </View>
                  <View style={styles.sectionContent}>
                    {section.content.map((item, index) => (
                      <Text
                        key={index}
                        style={[styles.sectionItem, { color: colors.text }]}
                      >
                        • {item}
                      </Text>
                    ))}
                  </View>
                </View>
              ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  refreshButton: {
    padding: 10,
    borderRadius: 10,
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 12,
  },
  statCard: {
    width: (screenWidth - 48) / 2,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  chartContainer: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 16,
    gap: 10,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.3,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
  },
  sectionCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  sectionContent: {
    gap: 8,
  },
  sectionItem: {
    fontSize: 15,
    lineHeight: 22,
  },
});
