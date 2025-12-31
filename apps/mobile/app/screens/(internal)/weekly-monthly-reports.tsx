import React, { useState } from "react";
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
import { Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;

interface WeeklyData {
  day: string;
  pomodoros: number;
  tasks: number;
}

interface MonthlyData {
  week: string;
  pomodoros: number;
  tasks: number;
}

interface Period {
  key: "week" | "month";
  label: string;
}

interface ReportsViewProps {
  onRefresh?: () => void;
  onGenerateReport?: () => void;
}

const MOCK_WEEKLY_DATA: WeeklyData[] = [
  { day: "Lun", pomodoros: 6, tasks: 5 },
  { day: "Mar", pomodoros: 8, tasks: 7 },
  { day: "Mie", pomodoros: 4, tasks: 3 },
  { day: "Jue", pomodoros: 7, tasks: 6 },
  { day: "Vie", pomodoros: 5, tasks: 4 },
  { day: "Sab", pomodoros: 2, tasks: 2 },
  { day: "Dom", pomodoros: 0, tasks: 1 },
];

const MOCK_MONTHLY_DATA: MonthlyData[] = [
  { week: "Sem 1", pomodoros: 32, tasks: 28 },
  { week: "Sem 2", pomodoros: 28, tasks: 25 },
  { week: "Sem 3", pomodoros: 35, tasks: 30 },
  { week: "Sem 4", pomodoros: 30, tasks: 26 },
];

const PERIODS: Period[] = [
  { key: "week", label: "Semana" },
  { key: "month", label: "Mes" },
];

export default function ReportsView({
  onRefresh,
  onGenerateReport,
}: ReportsViewProps) {
  const colors = useThemeColors();
  const [activePeriod, setActivePeriod] = useState<"week" | "month">("week");
  const [isGenerating, setIsGenerating] = useState(false);

  const totalPomodoros =
    activePeriod === "week"
      ? MOCK_WEEKLY_DATA.reduce((sum, d) => sum + d.pomodoros, 0)
      : MOCK_MONTHLY_DATA.reduce((sum, d) => sum + d.pomodoros, 0);

  const totalTasks =
    activePeriod === "week"
      ? MOCK_WEEKLY_DATA.reduce((sum, d) => sum + d.tasks, 0)
      : MOCK_MONTHLY_DATA.reduce((sum, d) => sum + d.tasks, 0);

  const avgPomodoros =
    activePeriod === "week"
      ? (totalPomodoros / 7).toFixed(1)
      : (totalPomodoros / 4).toFixed(1);

  const getChartData = () => {
    const data = activePeriod === "week" ? MOCK_WEEKLY_DATA : MOCK_MONTHLY_DATA;
    return data.map((d) => d.pomodoros);
  };

  const getLabels = () => {
    const data = activePeriod === "week" ? MOCK_WEEKLY_DATA : MOCK_MONTHLY_DATA;
    return data.map((d) => (activePeriod === "week" ? d.day : d.week));
  };

  const handleGenerate = async () => {
    if (!onGenerateReport) return;

    setIsGenerating(true);
    try {
      await onGenerateReport();
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Reports
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            {activePeriod === "week"
              ? "Productividad semanal"
              : "Productividad mensual"}
          </Text>
        </View>
        <View style={styles.headerActions}>
          {onRefresh && (
            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: colors.surface }]}
              onPress={onRefresh}
            >
              <Feather
                name="refresh-cw"
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Period Selector */}
      <View
        style={[styles.periodSelector, { backgroundColor: colors.surface }]}
      >
        {PERIODS.map((period) => (
          <TouchableOpacity
            key={period.key}
            style={[
              styles.periodButton,
              {
                backgroundColor:
                  activePeriod === period.key
                    ? colors.primary + "15"
                    : "transparent",
                borderColor:
                  activePeriod === period.key ? colors.primary : "transparent",
              },
            ]}
            onPress={() => setActivePeriod(period.key as "week" | "month")}
          >
            <Text
              style={[
                styles.periodButtonText,
                {
                  color:
                    activePeriod === period.key
                      ? colors.primary
                      : colors.textSecondary,
                  fontWeight: activePeriod === period.key ? "700" : "500",
                },
              ]}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <View
            style={[styles.summaryCard, { backgroundColor: colors.surface }]}
          >
            <Feather name="clock" size={24} color={colors.primary} />
            <View style={styles.summaryContent}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
                Total Pomodoros
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {totalPomodoros}
              </Text>
            </View>
          </View>

          <View
            style={[styles.summaryCard, { backgroundColor: colors.surface }]}
          >
            <Feather name="check-square" size={24} color="#10B981" />
            <View style={styles.summaryContent}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
                Tareas Completadas
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {totalTasks}
              </Text>
            </View>
          </View>

          <View
            style={[styles.summaryCard, { backgroundColor: colors.surface }]}
          >
            <Feather name="bar-chart-2" size={24} color="#F59E0B" />
            <View style={styles.summaryContent}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
                Promedio/Día
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {avgPomodoros}
              </Text>
            </View>
          </View>

          <View
            style={[styles.summaryCard, { backgroundColor: colors.surface }]}
          >
            <Feather name="target" size={24} color="#3B82F6" />
            <View style={styles.summaryContent}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
                Meta Diaria
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {activePeriod === "week" ? "4" : "28"}
              </Text>
            </View>
          </View>
        </View>

        {/* Chart */}
        <View
          style={[styles.chartContainer, { backgroundColor: colors.surface }]}
        >
          <Text style={[styles.chartTitle, { color: colors.text }]}>
            Productividad - {activePeriod === "week" ? "Días" : "Semanas"}
          </Text>
          <View style={styles.chartPlaceholder}>
            <View
              style={[
                styles.barChart,
                {
                  borderColor: colors.border,
                },
              ]}
            >
              {getChartData().map((value, index) => {
                const max = Math.max(...getChartData());
                const height = (value / max) * 150;
                return (
                  <View key={index} style={styles.barGroup}>
                    <Text
                      style={[styles.barLabel, { color: colors.textMuted }]}
                    >
                      {getLabels()[index]}
                    </Text>
                    <View style={styles.barContainer}>
                      <View
                        style={[
                          styles.bar,
                          {
                            backgroundColor: colors.primary,
                            height,
                          },
                        ]}
                      />
                      <Text style={[styles.barValue, { color: colors.text }]}>
                        {value}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Insights */}
        <View
          style={[
            styles.insightsContainer,
            { backgroundColor: colors.surface },
          ]}
        >
          <Text style={[styles.insightsTitle, { color: colors.text }]}>
            Insights
          </Text>
          <View style={styles.insightList}>
            <View style={styles.insightItem}>
              <Feather name="trending-up" size={16} color="#10B981" />
              <Text style={[styles.insightText, { color: colors.text }]}>
                Productividad un 15% mayor que el período anterior
              </Text>
            </View>
            <View style={styles.insightItem}>
              <Feather name="award" size={16} color="#F59E0B" />
              <Text style={[styles.insightText, { color: colors.text }]}>
                Racha de 4 días con más de 4 pomodoros
              </Text>
            </View>
            <View style={styles.insightItem}>
              <Feather name="zap" size={16} color="#3B82F6" />
              <Text style={[styles.insightText, { color: colors.text }]}>
                Mejor día: {activePeriod === "week" ? "Martes" : "Semana 2"}
              </Text>
            </View>
            <View style={styles.insightItem}>
              <Feather name="info" size={16} color={colors.textSecondary} />
              <Text style={[styles.insightText, { color: colors.text }]}>
                Pico de productividad: 9:00 - 11:00
              </Text>
            </View>
          </View>
        </View>

        {/* Generate Report Button */}
        <TouchableOpacity
          style={[styles.generateButton, { backgroundColor: colors.primary }]}
          onPress={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Feather name="file-text" size={20} color="#FFFFFF" />
              <Text style={styles.generateButtonText}>Generar Reporte</Text>
            </>
          )}
        </TouchableOpacity>
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
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  periodSelector: {
    flexDirection: "row",
    padding: 12,
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
  },
  periodButtonText: {
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    minWidth: (screenWidth - 48) / 2,
    padding: 18,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  summaryContent: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  chartContainer: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  chartPlaceholder: {
    minHeight: 200,
  },
  barChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 180,
    paddingBottom: 30,
    borderBottomWidth: 2,
    gap: 8,
  },
  barGroup: {
    flex: 1,
    alignItems: "center",
  },
  barLabel: {
    fontSize: 11,
    marginBottom: 8,
  },
  barContainer: {
    alignItems: "flex-end",
    flex: 1,
  },
  bar: {
    width: "100%",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    minHeight: 20,
  },
  barValue: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
  },
  insightsContainer: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  insightList: {
    gap: 14,
  },
  insightItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  insightText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    margin: 16,
    padding: 18,
    borderRadius: 14,
    gap: 10,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
