import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDailyMetrics, useDashboardStats } from "../../lib/shared-hooks";
import { useDesignTokens } from "../../lib/use-design-tokens";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import ReportsView from "./weekly-monthly-reports";
import { AIWeeklyReport } from "./ai-weekly-report";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  iconName: keyof typeof Ionicons.glyphMap;
  trend?: { value: number; isPositive: boolean };
}

function StatCard({ title, value, subtitle, iconName, trend }: StatCardProps) {
  const { colors, spacing } = useDesignTokens();

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: spacing[2],
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.mutedForeground, fontSize: 14 }}>
            {title}
          </Text>
          <Text
            style={{
              color: colors.foreground,
              fontSize: 28,
              fontWeight: "700",
              marginTop: 4,
            }}
          >
            {value}
          </Text>
          {subtitle && (
            <Text
              style={{
                color: colors.mutedForeground,
                fontSize: 13,
                marginTop: 2,
              }}
            >
              {subtitle}
            </Text>
          )}
          {trend && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 8,
                gap: 4,
              }}
            >
              <Ionicons
                name={trend.isPositive ? "trending-up" : "trending-down"}
                size={14}
                color={trend.isPositive ? "#10B981" : "#EF4444"}
              />
              <Text
                style={{
                  color: trend.isPositive ? "#10B981" : "#EF4444",
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                {Math.abs(trend.value)}% vs semana anterior
              </Text>
            </View>
          )}
        </View>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: "rgba(124, 58, 237, 0.1)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name={iconName} size={24} color="#7C3AED" />
        </View>
      </View>
    </View>
  );
}

export default function AnalyticsScreen() {
  const { t } = useTranslation();
  const [selectedView, setSelectedView] = useState<
    "overview" | "weekly" | "monthly" | "ai"
  >("overview");
  const { colors, spacing } = useDesignTokens();

  const { data: dashboardStats, isLoading: statsLoading } = useDashboardStats();

  const today = new Date();
  const { data: todayMetricsArray } = useDailyMetrics({
    startDate: new Date(today.setHours(0, 0, 0, 0)).toISOString(),
    endDate: new Date(today.setHours(23, 59, 59, 999)).toISOString(),
  });
  const todayMetrics = todayMetricsArray?.[0];

  const views = [
    { id: "overview" as const, label: "Resumen" },
    { id: "weekly" as const, label: "Semanal" },
    { id: "monthly" as const, label: "Mensual" },
    { id: "ai" as const, label: "IA" },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              backgroundColor: "#06b6d4",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="bar-chart" size={24} color="#FFFFFF" />
          </View>
          <View>
            <Text
              style={{
                color: colors.foreground,
                fontSize: 28,
                fontWeight: "700",
              }}
            >
              Analytics
            </Text>
            <Text
              style={{
                color: colors.mutedForeground,
                fontSize: 15,
                marginTop: 4,
              }}
            >
              Tu productividad
            </Text>
          </View>
        </View>
      </View>

      {/* View Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{
          backgroundColor: colors.card,
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
        contentContainerStyle={{ gap: 8 }}
      >
        {views.map((view) => (
          <TouchableOpacity
            key={view.id}
            onPress={() => setSelectedView(view.id)}
            style={[
              {
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor:
                  selectedView === view.id
                    ? "rgba(124, 58, 237, 0.1)"
                    : "transparent",
                borderWidth: 1,
                borderColor:
                  selectedView === view.id ? "#7C3AED" : colors.border,
              },
            ]}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color:
                  selectedView === view.id ? "#7C3AED" : colors.mutedForeground,
              }}
            >
              {view.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView style={{ flex: 1 }}>
        {selectedView === "overview" && (
          <View style={{ gap: 16, padding: 16 }}>
            {/* Quick Stats */}
            {dashboardStats && (
              <>
                <StatCard
                  title="Pomodoros"
                  value={dashboardStats.pomodoros || 0}
                  subtitle="esta semana"
                  iconName="timer"
                  trend={
                    dashboardStats.trends
                      ? {
                          value: Math.abs(dashboardStats.trends.pomodoros || 0),
                          isPositive:
                            (dashboardStats.trends.pomodoros || 0) >= 0,
                        }
                      : undefined
                  }
                />
                <StatCard
                  title="Tareas"
                  value={dashboardStats.tasks || 0}
                  iconName="checkmark-circle"
                  trend={
                    dashboardStats.trends
                      ? {
                          value: Math.abs(dashboardStats.trends.tasks || 0),
                          isPositive: (dashboardStats.trends.tasks || 0) >= 0,
                        }
                      : undefined
                  }
                />
                <StatCard
                  title="Racha"
                  value={5}
                  subtitle="días"
                  iconName="flame"
                />
                <StatCard
                  title="Promedio/día"
                  value={dashboardStats.avgPerDay || 0}
                  subtitle="pomodoros"
                  iconName="analytics"
                />
              </>
            )}

            {/* Summary Cards */}
            {dashboardStats && (
              <>
                <View
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 12,
                  }}
                >
                  <Text
                    style={{
                      color: colors.mutedForeground,
                      fontSize: 14,
                      marginBottom: 8,
                    }}
                  >
                    Tiempo Total Enfocado
                  </Text>
                  <Text
                    style={{
                      color: colors.foreground,
                      fontSize: 32,
                      fontWeight: "700",
                    }}
                  >
                    {Math.floor((dashboardStats.minutes || 0) / 60)}h{" "}
                    {(dashboardStats.minutes || 0) % 60}m
                  </Text>
                  <Text
                    style={{
                      color: colors.mutedForeground,
                      fontSize: 13,
                      marginTop: 4,
                    }}
                  >
                    ~{Math.round((dashboardStats.minutes || 0) / 7)}min promedio
                    por día
                  </Text>
                </View>

                <View
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 12,
                  }}
                >
                  <Text
                    style={{
                      color: colors.mutedForeground,
                      fontSize: 14,
                      marginBottom: 8,
                    }}
                  >
                    Mejor Día
                  </Text>
                  <Text
                    style={{
                      color: colors.foreground,
                      fontSize: 32,
                      fontWeight: "700",
                    }}
                  >
                    Martes
                  </Text>
                  <Text
                    style={{
                      color: colors.mutedForeground,
                      fontSize: 13,
                      marginTop: 4,
                    }}
                  >
                    8 pomodoros completados
                  </Text>
                </View>

                <View
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 12,
                  }}
                >
                  <Text
                    style={{
                      color: colors.mutedForeground,
                      fontSize: 14,
                      marginBottom: 8,
                    }}
                  >
                    Eficiencia
                  </Text>
                  <Text
                    style={{
                      color: colors.foreground,
                      fontSize: 32,
                      fontWeight: "700",
                    }}
                  >
                    87%
                  </Text>
                  <Text
                    style={{
                      color: colors.mutedForeground,
                      fontSize: 13,
                      marginTop: 4,
                    }}
                  >
                    Sesiones completadas sin interrupciones
                  </Text>
                </View>
              </>
            )}

            {/* Focus Score */}
            {todayMetrics?.focusScore !== undefined && (
              <View
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 16,
                  padding: 16,
                }}
              >
                <Text
                  style={{
                    color: colors.foreground,
                    fontSize: 18,
                    fontWeight: "700",
                    marginBottom: 16,
                  }}
                >
                  Focus Score
                </Text>
                <View style={{ alignItems: "center", paddingVertical: 24 }}>
                  <View
                    style={{
                      width: 150,
                      height: 150,
                      borderRadius: 75,
                      borderWidth: 12,
                      borderColor: "#10B981",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: colors.foreground,
                        fontSize: 36,
                        fontWeight: "700",
                      }}
                    >
                      {todayMetrics.focusScore}
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: colors.mutedForeground,
                      fontSize: 14,
                      marginTop: 16,
                    }}
                  >
                    {todayMetrics.focusScore >= 80
                      ? "Excelente"
                      : todayMetrics.focusScore >= 50
                        ? "Moderado"
                        : "Necesita mejorar"}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {selectedView === "weekly" && <ReportsView />}

        {selectedView === "monthly" && <ReportsView />}

        {selectedView === "ai" && <AIWeeklyReport />}
      </ScrollView>
    </SafeAreaView>
  );
}
