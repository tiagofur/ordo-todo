import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { format, addDays, startOfWeek, isSameDay, parseISO } from "date-fns";
import { es, enUS, ptBR } from "date-fns/locale";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeColors } from "@/app/data/hooks/use-theme-colors.hook";
import { apiClient } from "@/app/lib/api-client";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DAY_PILL_WIDTH = (SCREEN_WIDTH - 48) / 7;

// Time slots from 6 AM to 10 PM
const TIME_SLOTS = Array.from({ length: 17 }, (_, i) => i + 6);

interface TimeBlockData {
  id: string;
  title: string;
  status: string;
  priority: string;
  scheduledDate: Date | string | null;
  scheduledTime: string | null;
  scheduledEndTime: string | null;
  estimatedTime: number | null;
  project: { id: string; name: string; color: string } | null;
}

function parseTime(timeStr: string | null): number {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours + minutes / 60;
}

function getBlockStyle(block: TimeBlockData): { top: number; height: number } {
  const startTime = parseTime(block.scheduledTime);
  const endTime = block.scheduledEndTime
    ? parseTime(block.scheduledEndTime)
    : startTime + (block.estimatedTime || 60) / 60;

  const startOffset = (startTime - 6) * 60; // px from top
  const duration = Math.max((endTime - startTime) * 60, 30);

  return {
    top: startOffset,
    height: duration,
  };
}

export default function CalendarScreen() {
  const colors = useThemeColors();
  const { t, i18n } = useTranslation();
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [selectedDay, setSelectedDay] = useState(new Date());

  // Get locale for date formatting
  const dateLocale = i18n.language === 'pt-br' ? ptBR : i18n.language === 'en' ? enUS : es;

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  const weekEnd = addDays(weekStart, 6);

  const { data: timeBlocks = [], isLoading } = useQuery({
    queryKey: ["time-blocks", weekStart.toISOString()],
    queryFn: () => apiClient.getTimeBlocks(weekStart, weekEnd),
  });

  const dayBlocks = useMemo(() => {
    const selectedDateKey = format(selectedDay, "yyyy-MM-dd");
    return (timeBlocks as TimeBlockData[]).filter((block) => {
      if (!block.scheduledDate) return false;
      const blockDate = format(
        new Date(block.scheduledDate),
        "yyyy-MM-dd"
      );
      return blockDate === selectedDateKey;
    });
  }, [timeBlocks, selectedDay]);

  const goToPrevWeek = () => {
    const newWeekStart = addDays(weekStart, -7);
    setWeekStart(newWeekStart);
    setSelectedDay(newWeekStart);
  };

  const goToNextWeek = () => {
    const newWeekStart = addDays(weekStart, 7);
    setWeekStart(newWeekStart);
    setSelectedDay(newWeekStart);
  };

  const handleBlockPress = (block: TimeBlockData) => {
    router.push(`/screens/(internal)/task?id=${block.id}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
        <View style={styles.headerContent}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark || colors.primary]}
            style={styles.iconContainer}
          >
            <Feather name="calendar" size={24} color="#FFFFFF" />
          </LinearGradient>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>
              {t('Mobile.calendar.title')}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              {t('Mobile.calendar.subtitle')}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Week Navigator */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(300)}
        style={[styles.weekNav, { backgroundColor: colors.card }]}
      >
        <Pressable onPress={goToPrevWeek} style={styles.navButton}>
          <Feather name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.weekText, { color: colors.text }]}>
          {format(weekStart, "d MMM", { locale: dateLocale })} -{" "}
          {format(weekEnd, "d MMM yyyy", { locale: dateLocale })}
        </Text>
        <Pressable onPress={goToNextWeek} style={styles.navButton}>
          <Feather name="chevron-right" size={24} color={colors.text} />
        </Pressable>
      </Animated.View>

      {/* Day Selector */}
      <Animated.View
        entering={FadeInDown.delay(200).duration(300)}
        style={styles.daySelector}
      >
        {weekDays.map((day, index) => {
          const isSelected = isSameDay(day, selectedDay);
          const isToday = isSameDay(day, new Date());

          return (
            <Pressable
              key={day.toISOString()}
              onPress={() => setSelectedDay(day)}
              style={[
                styles.dayPill,
                isSelected && { backgroundColor: colors.primary },
                isToday && !isSelected && { borderColor: colors.primary, borderWidth: 2 },
              ]}
            >
              <Text
                style={[
                  styles.dayName,
                  { color: isSelected ? "#FFFFFF" : colors.textMuted },
                ]}
              >
                {format(day, "EEE", { locale: dateLocale }).slice(0, 2).toUpperCase()}
              </Text>
              <Text
                style={[
                  styles.dayNumber,
                  { color: isSelected ? "#FFFFFF" : colors.text },
                ]}
              >
                {format(day, "d")}
              </Text>
            </Pressable>
          );
        })}
      </Animated.View>

      {/* Time Grid */}
      <ScrollView
        style={styles.timeGrid}
        contentContainerStyle={styles.timeGridContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {/* Time Labels */}
            <View style={styles.timeLabels}>
              {TIME_SLOTS.map((hour) => (
                <View key={hour} style={styles.timeLabel}>
                  <Text style={[styles.timeLabelText, { color: colors.textMuted }]}>
                    {hour}:00
                  </Text>
                </View>
              ))}
            </View>

            {/* Blocks Area */}
            <View style={[styles.blocksArea, { borderColor: colors.border }]}>
              {/* Hour Lines */}
              {TIME_SLOTS.map((hour) => (
                <View
                  key={hour}
                  style={[styles.hourLine, { borderColor: colors.border }]}
                />
              ))}

              {/* Time Blocks */}
              {dayBlocks.map((block) => {
                const style = getBlockStyle(block);
                const projectColor = block.project?.color || colors.primary;
                const isCompleted = block.status === "COMPLETED";

                return (
                  <Pressable
                    key={block.id}
                    onPress={() => handleBlockPress(block)}
                    style={[
                      styles.timeBlock,
                      {
                        top: style.top,
                        height: style.height,
                        backgroundColor: `${projectColor}20`,
                        borderLeftColor: projectColor,
                        opacity: isCompleted ? 0.6 : 1,
                      },
                    ]}
                  >
                    <View style={styles.blockContent}>
                      {isCompleted && (
                        <Feather
                          name="check"
                          size={12}
                          color="#22c55e"
                          style={styles.checkIcon}
                        />
                      )}
                      <Text
                        style={[
                          styles.blockTitle,
                          { color: projectColor },
                          isCompleted && styles.completedText,
                        ]}
                        numberOfLines={2}
                      >
                        {block.title}
                      </Text>
                    </View>
                    {style.height > 40 && (
                      <Text style={[styles.blockTime, { color: colors.textMuted }]}>
                        {block.scheduledTime}
                        {block.scheduledEndTime && ` - ${block.scheduledEndTime}`}
                      </Text>
                    )}
                  </Pressable>
                );
              })}

              {/* Empty State */}
              {dayBlocks.length === 0 && !isLoading && (
                <View style={styles.emptyState}>
                  <Feather name="calendar" size={48} color={colors.textMuted} />
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                    {t('Mobile.calendar.noBlocks')}
                  </Text>
                  <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
                    {t('Mobile.calendar.noBlocksHint')}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  weekNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 20,
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  weekText: {
    fontSize: 16,
    fontWeight: "600",
  },
  daySelector: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 6,
  },
  dayPill: {
    width: DAY_PILL_WIDTH,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  dayName: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: "bold",
  },
  timeGrid: {
    flex: 1,
    marginHorizontal: 16,
  },
  timeGridContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
  },
  gridContainer: {
    flexDirection: "row",
  },
  timeLabels: {
    width: 50,
  },
  timeLabel: {
    height: 60,
    justifyContent: "flex-start",
  },
  timeLabelText: {
    fontSize: 12,
  },
  blocksArea: {
    flex: 1,
    position: "relative",
    borderLeftWidth: 1,
    marginLeft: 8,
  },
  hourLine: {
    height: 60,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  timeBlock: {
    position: "absolute",
    left: 4,
    right: 4,
    borderLeftWidth: 3,
    borderRadius: 8,
    padding: 8,
    overflow: "hidden",
  },
  blockContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4,
  },
  checkIcon: {
    marginTop: 2,
  },
  blockTitle: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  completedText: {
    textDecorationLine: "line-through",
  },
  blockTime: {
    fontSize: 10,
    marginTop: 4,
  },
  emptyState: {
    position: "absolute",
    top: 100,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
});
