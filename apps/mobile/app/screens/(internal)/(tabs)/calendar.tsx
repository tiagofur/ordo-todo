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
import { useDesignTokens } from "@/app/lib/use-design-tokens";
import { apiClient } from "@/app/lib/api-client";
import { router } from "expo-router";
import { toCalendarDateString } from "@ordo-todo/core";
import { useTranslation } from "react-i18next";

import { useMediaQuery } from "@/app/lib/hooks/use-media-query";

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
  estimatedMinutes: number | null;
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
    : startTime + (block.estimatedMinutes || 60) / 60;

  const startOffset = (startTime - 6) * 60; // px from top
  const duration = Math.max((endTime - startTime) * 60, 30);

  return {
    top: startOffset,
    height: duration,
  };
}

export default function CalendarScreen() {
  const { colors, spacing, borderRadius } = useDesignTokens();
  const { t, i18n } = useTranslation();
  const { isTablet, width, select } = useMediaQuery();
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [selectedDay, setSelectedDay] = useState(new Date());

  const DAY_PILL_WIDTH = (width - (isTablet ? 64 : 48)) / 7;

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
    const selectedDateKey = toCalendarDateString(selectedDay);
    return (timeBlocks as TimeBlockData[]).filter((block) => {
      if (!block.scheduledDate) return false;
      const blockDate = toCalendarDateString(block.scheduledDate);
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
      {/* Header - Premium Iconic Design */}
      <View style={[styles.headerContainer, isTablet && { paddingHorizontal: 32, paddingTop: 100 }]}>
        <Animated.View 
          entering={FadeInDown.duration(600)}
          style={[
            styles.headerMainContainer, 
            { 
              backgroundColor: colors.card, 
              borderColor: colors.border
            },
            isTablet && { padding: 32, borderRadius: 40 }
          ]}
        >
          {/* Background Decorations */}
          <View style={[styles.headerDecoration, { top: -20, right: -20, backgroundColor: colors.section.calendar + '10' }]} />
          <View style={[styles.headerDecoration, { bottom: -10, left: -30, width: 80, height: 80, backgroundColor: colors.section.calendar + '10' }]} />

          <View style={styles.headerTop}>
            <View style={[
              styles.headerIconBox, 
              { 
                backgroundColor: colors.section.calendar, 
                shadowColor: colors.section.calendar, 
                shadowOpacity: 0.3, 
                shadowRadius: 15, 
                elevation: 8,
                width: isTablet ? 80 : 64,
                height: isTablet ? 80 : 64,
                borderRadius: isTablet ? 24 : 20,
                transform: [{ rotate: '3deg' }]
              }
            ]}>
              <Feather name="calendar" size={isTablet ? 40 : 32} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.headerTitle, { color: colors.foreground, fontSize: isTablet ? 40 : 28 }]}>{t('Mobile.calendar.title')}</Text>
              <Text style={[styles.headerSubtitle, { color: colors.mutedForeground, fontSize: isTablet ? 18 : 14 }]}>
                {t('Mobile.calendar.subtitle')}
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>

      <Animated.View
        entering={FadeInDown.delay(100).duration(300)}
        style={[styles.weekNav, { backgroundColor: colors.card }, isTablet && { marginHorizontal: 32, paddingVertical: 16 }]}
      >
        <Pressable onPress={goToPrevWeek} style={styles.navButton}>
          <Feather name="chevron-left" size={isTablet ? 28 : 24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.weekText, { color: colors.foreground, fontSize: isTablet ? 18 : 15 }]}>
          {format(weekStart, "d MMM", { locale: dateLocale })} -{" "}
          {format(weekEnd, "d MMM yyyy", { locale: dateLocale })}
        </Text>
        <Pressable onPress={goToNextWeek} style={styles.navButton}>
          <Feather name="chevron-right" size={isTablet ? 28 : 24} color={colors.foreground} />
        </Pressable>
      </Animated.View>

      {/* Day Selector */}
      <Animated.View
        entering={FadeInDown.delay(200).duration(300)}
        style={[styles.daySelector, isTablet && { paddingHorizontal: 32, gap: 12 }]}
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
                { width: (width - (isTablet ? 64 + (12 * 6) : 48 + (6 * 6))) / 7 },
                isSelected && { backgroundColor: colors.section.calendar },
                isToday && !isSelected && { borderColor: colors.section.calendar, borderWidth: 2 },
              ]}
            >
              <Text
                style={[
                  styles.dayName,
                  { color: isSelected ? "#FFFFFF" : colors.mutedForeground, fontSize: isTablet ? 12 : 10 },
                ]}
              >
                {format(day, "EEE", { locale: dateLocale }).slice(0, 2).toUpperCase()}
              </Text>
              <Text
                style={[
                  styles.dayNumber,
                  { color: isSelected ? "#FFFFFF" : colors.foreground, fontSize: isTablet ? 22 : 17 },
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
                  <Text style={[styles.timeLabelText, { color: colors.mutedForeground }]}>
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
                const projectColor = block.project?.color || colors.section.calendar;
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
                      <Text style={[styles.blockTime, { color: colors.mutedForeground }]}>
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
                  <Feather name="calendar" size={48} color={colors.mutedForeground} />
                  <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                    {t('Mobile.calendar.noBlocks')}
                  </Text>
                  <Text style={[styles.emptySubtext, { color: colors.mutedForeground }]}>
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
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
    padding: 16,
    paddingTop: 60,
    marginBottom: 8,
  },
  headerMainContainer: {
    padding: 20,
    borderRadius: 32,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  headerDecoration: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    position: 'relative',
    zIndex: 10,
  },
  headerIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2
  },
  weekNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  weekText: {
    fontSize: 15,
    fontWeight: "700",
  },
  daySelector: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 6,
  },
  dayPill: {
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  dayName: {
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 17,
    fontWeight: "800",
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
    fontSize: 11,
    fontWeight: '600'
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
    borderLeftWidth: 4,
    borderRadius: 12,
    padding: 10,
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
    fontWeight: "700",
    flex: 1,
  },
  completedText: {
    textDecorationLine: "line-through",
  },
  blockTime: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500'
  },
  emptyState: {
    position: "absolute",
    top: 100,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 12
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "800",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
    fontWeight: '500',
    lineHeight: 20
  },
});
