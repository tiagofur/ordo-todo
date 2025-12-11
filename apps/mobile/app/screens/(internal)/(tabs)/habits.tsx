import { useThemeColors } from "@/app/data/hooks/use-theme-colors.hook";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, RefreshControl, Alert } from "react-native";
import React, { useState, useCallback } from "react";
import Animated, {
  FadeInDown,
  FadeInRight,
  Layout,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import Card from "@/app/components/shared/card.component";
import { useTodayHabits, useCompleteHabit, useUncompleteHabit } from "@/app/hooks/api";
import type { Habit } from "@ordo-todo/api-client";

export default function Habits() {
  const colors = useThemeColors();
  
  // Hooks
  const { data: todayData, isLoading, error, refetch } = useTodayHabits();
  const completeHabit = useCompleteHabit();
  const uncompleteHabit = useUncompleteHabit();

  const habits = todayData?.habits ?? [];
  const summary = todayData?.summary ?? { total: 0, completed: 0, remaining: 0, percentage: 0 };

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleCompleteHabit = async (habitId: string, isCompleted: boolean) => {
    try {
      if (isCompleted) {
        await uncompleteHabit.mutateAsync(habitId);
      } else {
        const result = await completeHabit.mutateAsync({ habitId }) as {
          habit: { currentStreak: number };
          xpAwarded: number;
        };
        
        // Show streak messages
        if (result.habit.currentStreak === 7) {
          Alert.alert("🎉 Uma semana!", "Você completou uma semana de sequência!");
        } else if (result.habit.currentStreak === 30) {
          Alert.alert("🚀 Um mês!", "Você é imparável!");
        } else if (result.habit.currentStreak === 100) {
          Alert.alert("🏆 100 dias!", "Você é uma lenda!");
        }
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar o hábito");
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.error, marginBottom: 10 }}>Erro ao carregar hábitos</Text>
        <Pressable onPress={() => refetch()} style={{ padding: 10, backgroundColor: colors.card, borderRadius: 8 }}>
          <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

  // Find best streak
  const bestStreak = habits.length > 0 
    ? Math.max(...habits.map((h: Habit) => h.currentStreak || 0)) 
    : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header com gradiente */}
      <LinearGradient
        colors={["#10B981", "#059669"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View entering={FadeInDown.delay(100)}>
          <Text style={styles.greeting}>✨ Hábitos</Text>
          <Text style={styles.title}>Progresso do Dia</Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200)}
          style={styles.statsContainer}
        >
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{summary.completed}/{summary.total}</Text>
            <Text style={styles.statLabel}>Concluídos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{summary.percentage}%</Text>
            <Text style={styles.statLabel}>Progresso</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{bestStreak}</Text>
            <Text style={styles.statLabel}>🔥 Sequência</Text>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Progress Bar */}
      <Animated.View entering={FadeInRight.delay(300)} style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: colors.backgroundSecondary }]}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${summary.percentage}%`,
                backgroundColor: "#10B981"
              }
            ]} 
          />
        </View>
      </Animated.View>

      {/* Lista de hábitos */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
      >
        {habits.length === 0 ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Feather name="star" size={48} color={colors.textMuted} style={{ marginBottom: 10, opacity: 0.5 }} />
            <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
              Nenhum hábito ainda{"\n"}Crie seu primeiro hábito para começar!
            </Text>
          </View>
        ) : (
          habits.map((habit: Habit, index: number) => {
            const isCompleted = habit.completions && habit.completions.length > 0;
            const isPaused = habit.isPaused;
            
            return (
              <Animated.View
                key={habit.id}
                entering={FadeInDown.delay(400 + index * 100).springify()}
                layout={Layout.springify()}
                style={isPaused ? { opacity: 0.6 } : undefined}
              >
                <Card
                  style={styles.habitCard}
                >
                  <View style={styles.habitHeader}>
                    <View style={styles.habitHeaderLeft}>
                      {/* Completion Button */}
                      <Pressable 
                        onPress={() => handleCompleteHabit(habit.id, !!isCompleted)}
                        hitSlop={10}
                        disabled={isPaused || completeHabit.isPending || uncompleteHabit.isPending}
                        style={[
                          styles.checkButton,
                          { 
                            borderColor: isCompleted ? "#10B981" : colors.border,
                            backgroundColor: isCompleted ? "#10B981" : "transparent"
                          }
                        ]}
                      >
                        {isCompleted && (
                          <Feather name="check" size={16} color="#fff" />
                        )}
                      </Pressable>
                      
                      {/* Habit Icon */}
                      <View 
                        style={[
                          styles.habitIcon,
                          { backgroundColor: habit.color || "#10B981" }
                        ]}
                      >
                        <Feather name="star" size={18} color="#fff" />
                      </View>

                      <View style={styles.habitInfo}>
                        <Text 
                          style={[
                            styles.habitTitle, 
                            { 
                              color: colors.text,
                              textDecorationLine: isCompleted ? 'line-through' : 'none',
                              opacity: isCompleted ? 0.6 : 1
                            }
                          ]}
                        >
                          {habit.name}
                        </Text>
                        {habit.description && (
                          <Text
                            style={[styles.habitDescription, { color: colors.textSecondary }]}
                            numberOfLines={1}
                          >
                            {habit.description}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>

                  <View style={styles.habitFooter}>
                    {/* Frequency Badge */}
                    <View style={[styles.badge, { backgroundColor: colors.backgroundSecondary }]}>
                      <Text style={[styles.badgeText, { color: colors.textSecondary }]}>
                        {habit.frequency === 'DAILY' ? 'Diário' : 
                         habit.frequency === 'WEEKLY' ? 'Semanal' : 
                         habit.frequency}
                      </Text>
                    </View>

                    {/* Streak */}
                    {(habit.currentStreak || 0) > 0 && (
                      <View style={[styles.streakBadge, { backgroundColor: "#fef3c7" }]}>
                        <Text style={styles.streakText}>
                          🔥 {habit.currentStreak}
                        </Text>
                      </View>
                    )}

                    {/* Paused Badge */}
                    {isPaused && (
                      <View style={[styles.badge, { backgroundColor: colors.backgroundSecondary }]}>
                        <Feather name="pause" size={12} color={colors.textMuted} />
                        <Text style={[styles.badgeText, { color: colors.textMuted, marginLeft: 4 }]}>
                          Pausado
                        </Text>
                      </View>
                    )}
                  </View>
                </Card>
              </Animated.View>
            );
          })
        )}
        
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  greeting: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
    opacity: 0.9,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 20,
    letterSpacing: -1,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 11,
    color: "#FFFFFF",
    opacity: 0.9,
    marginTop: 4,
    fontWeight: "600",
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  habitCard: {
    marginBottom: 12,
  },
  habitHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  habitHeaderLeft: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
    gap: 12,
  },
  checkButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  habitIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  habitInfo: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  habitDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  habitFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  streakBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  streakText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#f59e0b",
  },
});
