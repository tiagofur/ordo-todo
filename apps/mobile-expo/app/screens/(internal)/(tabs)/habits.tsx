import { useDesignTokens } from "@/app/lib/use-design-tokens";
import { useMediaQuery } from "@/app/lib/hooks/use-media-query";
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, RefreshControl, Alert } from "react-native";
import React, { useState, useCallback } from "react";
import Animated, {
  FadeInDown,
  FadeInRight,
  Layout,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import Card from "@/app/components/shared/card.component";
import { useTodayHabits, useCompleteHabit, useUncompleteHabit } from "@/app/lib/shared-hooks";
import type { Habit } from "@ordo-todo/api-client";
import { useTranslation } from "react-i18next";

export default function Habits() {
  const { colors } = useDesignTokens();
  const { isTablet } = useMediaQuery();
  const { t } = useTranslation();
  
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
          Alert.alert(t('Mobile.habits.oneWeek'), t('Mobile.habits.oneWeekMessage'));
        } else if (result.habit.currentStreak === 30) {
          Alert.alert(t('Mobile.habits.oneMonth'), t('Mobile.habits.oneMonthMessage'));
        } else if (result.habit.currentStreak === 100) {
          Alert.alert(t('Mobile.habits.hundredDays'), t('Mobile.habits.hundredDaysMessage'));
        }
      }
    } catch (error) {
      Alert.alert(t('Mobile.common.error'), t('Mobile.habits.errorUpdating'));
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.section.habits} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.destructive, marginBottom: 10 }}>{t('Mobile.habits.loadError')}</Text>
        <Pressable onPress={() => refetch()} style={{ padding: 10, backgroundColor: colors.card, borderRadius: 8 }}>
          <Text style={{ color: colors.section.habits, fontWeight: 'bold' }}>{t('Mobile.habits.retry')}</Text>
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
      {/* Header - Standard Iconic Design */}
      <View style={[styles.headerContainer, isTablet && { paddingHorizontal: 32, paddingTop: 80 }]}>
        <View style={styles.headerMain}>
          <View style={[
            styles.headerIconBox, 
            { 
              backgroundColor: colors.section.habits, 
              shadowColor: colors.section.habits, 
              shadowOpacity: 0.3, 
              shadowRadius: 10, 
              elevation: 5,
              width: isTablet ? 64 : 52,
              height: isTablet ? 64 : 52,
            }
          ]}>
            <Feather name="star" size={isTablet ? 32 : 26} color="#FFF" />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: colors.foreground, fontSize: isTablet ? 36 : 28 }]}>{t('Mobile.tabs.habits')}</Text>
            <Text style={[styles.headerSubtitle, { color: colors.mutedForeground, fontSize: isTablet ? 16 : 14 }]}>
              {t('Mobile.habits.progress')}
            </Text>
          </View>
        </View>
      </View>

      {/* Progress Cards */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(300)}
        style={[styles.statsContainer, isTablet && { paddingHorizontal: 32, gap: 16 }]}
      >
        <View style={[styles.statCard, { backgroundColor: colors.card, borderLeftColor: colors.section.habits, borderLeftWidth: 4 }]}>
          <Text style={[styles.statNumber, { color: colors.foreground }]}>{summary.completed}/{summary.total}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{t('Mobile.habits.completed')}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderLeftColor: colors.section.habits, borderLeftWidth: 4 }]}>
          <Text style={[styles.statNumber, { color: colors.foreground }]}>{summary.percentage}%</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{t('Mobile.habits.progress')}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderLeftColor: colors.semantic.warning, borderLeftWidth: 4 }]}>
          <Text style={[styles.statNumber, { color: colors.foreground }]}>{bestStreak}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>🔥 {t('Mobile.habits.streak')}</Text>
        </View>
      </Animated.View>

      {/* Progress Bar */}
      <Animated.View entering={FadeInRight.delay(300)} style={[styles.progressContainer, isTablet && { paddingHorizontal: 32 }]}>
        <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${summary.percentage}%`,
                backgroundColor: colors.section.habits
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
            <Feather name="star" size={48} color={colors.mutedForeground} style={{ marginBottom: 10, opacity: 0.5 }} />
            <Text style={{ color: colors.mutedForeground, textAlign: 'center' }}>
              {t('Mobile.habits.noHabits')}{"\n"}{t('Mobile.habits.createFirst')}
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
                            borderColor: isCompleted ? colors.section.habits : colors.border,
                            backgroundColor: isCompleted ? colors.section.habits : "transparent"
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
                          { backgroundColor: habit.color || colors.section.habits }
                        ]}
                      >
                        <Feather name="star" size={18} color="#fff" />
                      </View>

                      <View style={styles.habitInfo}>
                        <Text 
                          style={[
                            styles.habitTitle, 
                            { 
                              color: colors.foreground,
                              textDecorationLine: isCompleted ? 'line-through' : 'none',
                              opacity: isCompleted ? 0.6 : 1
                            }
                          ]}
                        >
                          {habit.name}
                        </Text>
                        {habit.description && (
                          <Text
                            style={[styles.habitDescription, { color: colors.mutedForeground }]}
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
                    <View style={[styles.badge, { backgroundColor: colors.muted }]}>
                      <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>
                        {habit.frequency === 'DAILY' ? 'Diário' : 
                         habit.frequency === 'WEEKLY' ? 'Semanal' : 
                         habit.frequency}
                      </Text>
                    </View>

                    {/* Streak */}
                    {(habit.currentStreak || 0) > 0 && (
                      <View style={[styles.streakBadge, { backgroundColor: `${colors.semantic.warning}20` }]}>
                        <Text style={[styles.streakText, { color: colors.semantic.warning }]}>
                          🔥 {habit.currentStreak}
                        </Text>
                      </View>
                    )}

                    {/* Paused Badge */}
                    {isPaused && (
                      <View style={[styles.badge, { backgroundColor: colors.muted }]}>
                        <Feather name="pause" size={12} color={colors.mutedForeground} />
                        <Text style={[styles.badgeText, { color: colors.mutedForeground, marginLeft: 4 }]}>
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
  headerContainer: {
    padding: 24,
    paddingTop: 60,
    marginBottom: 8,
  },
  headerMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  headerIconBox: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontWeight: '800',
    letterSpacing: -0.5
  },
  headerSubtitle: {
    fontWeight: '500',
    marginTop: 2
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 11,
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
  },
});
