/**
 * Calendar Screen - Mobile
 *
 * Weekly calendar view with time blocking for tasks
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { ChevronLeft, ChevronRight, Calendar, Clock, Plus } from 'lucide-react-native';

import { Text } from '@ordo-todo/ui-mobile';
import { colors } from '@ordo-todo/styles/tokens';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface Task {
  id: string;
  title: string;
  projectId?: string;
  color?: string;
  startTime?: string; // HH:MM format
  endTime?: string;
}

interface DayData {
  date: Date;
  tasks: Task[];
}

export default function CalendarScreen() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // Start from Monday
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  });

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<'week' | 'day'>('week');

  // Generate week days
  const getWeekDays = useCallback(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeekStart);
      day.setDate(currentWeekStart.getDate() + i);
      days.push(day);
    }
    return days;
  }, [currentWeekStart]);

  // Mock tasks for demonstration
  const getTasksForDate = useCallback((date: Date): Task[] => {
    // TODO: Replace with real data from API
    const mockTasks: Task[] = [
      {
        id: '1',
        title: 'Team standup',
        color: '#3B82F6',
        startTime: '09:00',
        endTime: '09:30',
      },
      {
        id: '2',
        title: 'Work on feature X',
        color: '#8B5CF6',
        startTime: '10:00',
        endTime: '12:00',
      },
      {
        id: '3',
        title: 'Lunch break',
        color: '#10B981',
        startTime: '12:00',
        endTime: '13:00',
      },
    ];
    return mockTasks;
  }, []);

  const weekDays = getWeekDays();
  const selectedTasks = getTasksForDate(selectedDate);

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newWeekStart);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDayName = (date: Date): string => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date): boolean => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View
          style={[styles.iconContainer, { backgroundColor: '#3B82F6' }]}
        >
          <Calendar size={24} color="#FFFFFF" strokeWidth={2.5} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Calendar</Text>
          <Text style={styles.subtitle}>Plan your week with time blocking</Text>
        </View>
      </View>

      {/* Week Navigation */}
      <View style={styles.weekNavigation}>
        <TouchableOpacity
          onPress={() => navigateWeek('prev')}
          style={styles.navButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronLeft size={24} color={colors.foreground} strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.weekInfo}>
          <Text style={styles.weekLabel}>
            {formatDate(currentWeekStart)} - {formatDate(new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000))}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => navigateWeek('next')}
          style={styles.navButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronRight size={24} color={colors.foreground} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Week Days Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.daysScroller}
        contentContainerStyle={styles.daysContainer}
      >
        {weekDays.map((day, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setSelectedDate(day)}
            style={[
              styles.dayItem,
              isSelected(day) && styles.dayItemSelected,
              isToday(day) && styles.dayItemToday,
            ]}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.dayName,
                isSelected(day) && styles.dayNameSelected,
              ]}
            >
              {getDayName(day)}
            </Text>
            <Text
              style={[
                styles.dayNumber,
                isSelected(day) && styles.dayNumberSelected,
                isToday(day) && styles.dayNumberToday,
              ]}
            >
              {day.getDate()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Day Content */}
      <ScrollView
        style={styles.dayContent}
        contentContainerStyle={styles.dayContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Date Header */}
        <View style={styles.dateHeader}>
          <Text style={styles.dateTitle}>
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          <TouchableOpacity style={styles.addButton}>
            <Plus size={20} color={colors.primary} strokeWidth={2.5} />
            <Text style={styles.addButtonText}>Add Task</Text>
          </TouchableOpacity>
        </View>

        {/* Tasks */}
        <View style={styles.tasksContainer}>
          {selectedTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Clock size={48} color={colors.mutedForeground} strokeWidth={1.5} />
              <Text style={styles.emptyText}>No tasks scheduled</Text>
              <Text style={styles.emptySubtext}>
                Tap "Add Task" to schedule your day
              </Text>
            </View>
          ) : (
            selectedTasks.map((task) => (
              <View
                key={task.id}
                style={[
                  styles.taskCard,
                  { borderLeftColor: task.color || colors.primary },
                ]}
              >
                <View style={styles.taskTime}>
                  <Text style={styles.taskTimeText}>
                    {task.startTime} - {task.endTime}
                  </Text>
                </View>
                <View style={styles.taskContent}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Unscheduled Tasks Section */}
        <View style={styles.unscheduledSection}>
          <Text style={styles.sectionTitle}>Unscheduled Tasks</Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptySubtext}>
              Drag tasks here to schedule them
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.foreground,
  },
  subtitle: {
    fontSize: 14,
    color: colors.mutedForeground,
    marginTop: 2,
  },
  weekNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  navButton: {
    padding: 8,
  },
  weekInfo: {
    flex: 1,
    alignItems: 'center',
  },
  weekLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
  },
  daysScroller: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  daysContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  dayItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 60,
  },
  dayItemSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayItemToday: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  dayName: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.mutedForeground,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  dayNameSelected: {
    color: '#FFFFFF',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.foreground,
  },
  dayNumberSelected: {
    color: '#FFFFFF',
  },
  dayNumberToday: {
    color: colors.primary,
  },
  dayContent: {
    flex: 1,
  },
  dayContentContainer: {
    padding: 16,
    gap: 24,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.foreground,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.accent,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accentForeground,
  },
  tasksContainer: {
    gap: 12,
  },
  taskCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    padding: 16,
    alignItems: 'center',
  },
  taskTime: {
    width: 100,
  },
  taskTimeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.foreground,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.foreground,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.mutedForeground,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
  unscheduledSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.foreground,
  },
});
