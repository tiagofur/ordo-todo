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

export interface DailyMetricsData {
  tasksCompleted: number;
  tasksCreated: number;
  focusScore: number; // 0-1
}

export interface TimerStatsData {
  totalMinutesWorked: number;
  pomodorosCompleted: number;
}

interface DailyMetricsCardProps {
  metrics?: DailyMetricsData | null;
  timerStats?: TimerStatsData | null;
  isLoading?: boolean;
  date?: Date;
  formatDuration?: (minutes: number) => string;
  labels?: {
    title?: string;
    today?: string;
    completed?: string;
    time?: string;
    pomodoros?: string;
    focus?: string;
  };
}

const defaultFormatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

const getFocusScoreColor = (score: number): string => {
  if (score >= 80) return "#10B981"; // green
  if (score >= 60) return "#F59E0B"; // yellow
  if (score >= 40) return "#F97316"; // orange
  return "#EF4444"; // red
};

const getFocusScoreText = (score: number): string => {
  if (score === undefined || score === null) return "N/A";
  return `${Math.round(score * 100)}%`;
};

export function DailyMetricsCard({
  metrics,
  timerStats,
  isLoading = false,
  date,
  formatDuration = defaultFormatDuration,
  labels = {},
}: DailyMetricsCardProps) {
  const colors = useThemeColors();
  const [selectedPeriod, setSelectedPeriod] = useState<
    "today" | "week" | "month"
  >("today");

  const defaultLabels = {
    title: "Daily Summary",
    today: "Today",
    completed: "Completed",
    time: "Time",
    pomodoros: "Pomodoros",
    focus: "Focus",
  };

  const t = { ...defaultLabels, ...labels };

  const formattedDate = date
    ? date.toLocaleDateString("es", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : t.today;

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t.title}
          </Text>
          <Text style={[styles.headerDate, { color: colors.textMuted }]}>
            {formattedDate}
          </Text>
        </View>
        <View style={styles.skeletonContainer}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.skeletonItem}>
              <View
                style={[
                  styles.skeletonLine,
                  { backgroundColor: colors.border },
                ]}
              />
              <View
                style={[
                  styles.skeletonLine,
                  styles.skeletonLineLarge,
                  { backgroundColor: colors.border },
                ]}
              />
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t.title}
          </Text>
          <Text style={[styles.headerDate, { color: colors.textMuted }]}>
            {formattedDate}
          </Text>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {(["today", "week", "month"] as const).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                {
                  backgroundColor:
                    selectedPeriod === period
                      ? colors.primary + "15"
                      : colors.background,
                  borderColor:
                    selectedPeriod === period ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  {
                    color:
                      selectedPeriod === period
                        ? colors.primary
                        : colors.textSecondary,
                  },
                ]}
              >
                {period === "today"
                  ? "Hoy"
                  : period === "week"
                    ? "Semana"
                    : "Mes"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.metricsGrid}>
          {/* Tasks Completed */}
          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.metricHeader}>
              <View
                style={[
                  styles.metricIcon,
                  { backgroundColor: "#10B981" + "15" },
                ]}
              >
                <Feather name="check-circle" size={20} color="#10B981" />
              </View>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
                {t.completed}
              </Text>
            </View>
            <View style={styles.metricValue}>
              <Text style={[styles.metricValueNumber, { color: colors.text }]}>
                {metrics?.tasksCompleted || 0}
              </Text>
              <Text
                style={[styles.metricValueDenom, { color: colors.textMuted }]}
              >
                / {metrics?.tasksCreated || 0}
              </Text>
            </View>
          </View>

          {/* Time Worked */}
          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.metricHeader}>
              <View
                style={[
                  styles.metricIcon,
                  { backgroundColor: "#3B82F6" + "15" },
                ]}
              >
                <Feather name="clock" size={20} color="#3B82F6" />
              </View>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
                {t.time}
              </Text>
            </View>
            <Text style={[styles.metricValueNumber, { color: colors.text }]}>
              {formatDuration(timerStats?.totalMinutesWorked || 0)}
            </Text>
          </View>

          {/* Pomodoros */}
          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.metricHeader}>
              <View
                style={[
                  styles.metricIcon,
                  { backgroundColor: "#F59E0B" + "15" },
                ]}
              >
                <Feather name="target" size={20} color="#F59E0B" />
              </View>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
                {t.pomodoros}
              </Text>
            </View>
            <Text style={[styles.metricValueNumber, { color: colors.text }]}>
              {timerStats?.pomodorosCompleted || 0}
            </Text>
          </View>

          {/* Focus Score */}
          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.metricHeader}>
              <View
                style={[
                  styles.metricIcon,
                  {
                    backgroundColor:
                      getFocusScoreColor(metrics?.focusScore || 0) + "15",
                  },
                ]}
              >
                <Feather
                  name="zap"
                  size={20}
                  color={getFocusScoreColor(metrics?.focusScore || 0)}
                />
              </View>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
                {t.focus}
              </Text>
            </View>
            <View style={styles.focusScoreContainer}>
              <Text style={[styles.metricValueNumber, { color: colors.text }]}>
                {getFocusScoreText(metrics?.focusScore || 0)}
              </Text>
              {/* Focus Score Gauge */}
              <View style={styles.focusGauge}>
                <View
                  style={[
                    styles.focusGaugeFill,
                    {
                      width: `${(metrics?.focusScore || 0) * 100}%`,
                      backgroundColor: getFocusScoreColor(
                        metrics?.focusScore || 0,
                      ),
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Insights Section */}
        <View
          style={[
            styles.insightsContainer,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.insightsTitle, { color: colors.text }]}>
            Insights
          </Text>
          <View style={styles.insightItem}>
            <Feather name="trending-up" size={16} color="#10B981" />
            <Text style={[styles.insightText, { color: colors.text }]}>
              {" "}
              Productividad por encima del promedio de ayer
            </Text>
          </View>
          <View style={styles.insightItem}>
            <Feather name="award" size={16} color="#F59E0B" />
            <Text style={[styles.insightText, { color: colors.text }]}>
              {" "}
              Racha actual: 5 días de trabajo constante
            </Text>
          </View>
          <View style={styles.insightItem}>
            <Feather name="info" size={16} color="#3B82F6" />
            <Text style={[styles.insightText, { color: colors.text }]}>
              {" "}
              Mejor hora de productividad: 10:00 - 12:00
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  headerDate: {
    fontSize: 14,
    marginTop: 4,
  },
  periodSelector: {
    flexDirection: "row",
    gap: 8,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  periodButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  content: {
    padding: 20,
  },
  metricsGrid: {
    gap: 16,
  },
  metricCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: "500",
    textTransform: "uppercase",
  },
  metricValue: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  metricValueNumber: {
    fontSize: 32,
    fontWeight: "700",
  },
  metricValueDenom: {
    fontSize: 16,
    fontWeight: "500",
  },
  focusScoreContainer: {
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 8,
  },
  focusGauge: {
    width: 120,
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  focusGaugeFill: {
    height: "100%",
    borderRadius: 4,
  },
  insightsContainer: {
    marginTop: 20,
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  insightItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 12,
  },
  insightText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  skeletonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  skeletonItem: {
    flex: 1,
    minWidth: "45%",
    maxWidth: "48%",
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "transparent",
  },
  skeletonLine: {
    height: 16,
    width: 80,
    borderRadius: 8,
  },
  skeletonLineLarge: {
    height: 32,
    width: 60,
  },
});
