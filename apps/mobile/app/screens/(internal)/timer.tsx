/**
 * Timer Screen - Mobile
 *
 * Pomodoro Timer with session history
 */

import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Clock, History, Timer as TimerIcon } from 'lucide-react-native';

import { Text } from '@ordo-todo/ui-mobile';
import { PomodoroTimer, TaskSelector, SessionHistory } from '@ordo-todo/ui-mobile';
import { useTimerBackend } from '@/app/hooks/use-timer-backend';
import { useTimerConfig } from '@/app/hooks/use-timer-config';
import { useTasks, useSessionHistory } from '@/app/lib/shared-hooks';
import { colors } from '@ordo-todo/styles/tokens';

export default function TimerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<'timer' | 'history'>((params.tab as 'timer' | 'history') || 'timer');

  // Timer configuration from user preferences (ODD 014 T6).
  const { config: timerConfig, type: timerType } = useTimerConfig();

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Use backend timer hook
  const timer = useTimerBackend({
    type: timerType,
    config: timerConfig,
    taskId: selectedTaskId,
    onSessionComplete: () => {
      // Refresh history when session completes
      historyQuery.refetch();
    },
  });

  // Fetch Tasks
  const { data: tasks } = useTasks();
  
  // Fetch History
  const historyQuery = useSessionHistory({ limit: 20 });
  const sessions = historyQuery.data?.sessions || [];

  // Map tasks for selector
  const mappedTasks = useMemo(() => {
    return tasks?.map(t => ({
      id: t.id,
      title: t.title,
      projectName: (t as any).project?.name,
      projectColor: (t as any).project?.color
    })) || [];
  }, [tasks]);

  // Timer state mapping
  const timerState = {
    isLoaded: true,
    isRunning: timer.isRunning,
    isPaused: timer.isPaused,
    timeLeft: timer.timeLeft,
    mode: timer.mode,
    completedPomodoros: timer.completedPomodoros,
    pauseCount: timer.pauseCount,
    defaultMode: timerType,
    selectedTaskId: timer.activeSession?.taskId || selectedTaskId,
    progress: timer.getProgress(),
  };

  // Timer actions mapping
  const timerActions = {
    start: timer.start,
    pause: timer.pause,
    resume: timer.resume,
    stop: timer.stop,
    skipToNext: timer.skipToNext,
    switchTask: timer.switchTask,
    setSelectedTaskId: (id: string | null) => {
        setSelectedTaskId(id);
        if (timer.isRunning && id) {
            timer.switchTask(id);
        }
    },
  };

  const MODE_COLORS = {
    WORK: '#ef4444',
    SHORT_BREAK: '#4ade80',
    LONG_BREAK: '#15803d',
    CONTINUOUS: '#3b82f6',
  };

  const accentColor = MODE_COLORS[timer.mode] || MODE_COLORS.WORK;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: accentColor },
          ]}
        >
          <TimerIcon size={24} color="#FFFFFF" strokeWidth={2.5} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Focus Timer</Text>
          <Text style={styles.subtitle}>
            Manage your time with the Pomodoro technique
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <View style={styles.tabsList}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'timer' && styles.activeTab]}
            onPress={() => setActiveTab('timer')}
          >
            <Clock size={16} color={activeTab === 'timer' ? accentColor : colors.mutedForeground} strokeWidth={2.5} />
            <Text style={[styles.tabText, activeTab === 'timer' && { color: accentColor }]}>
              Timer
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && styles.activeTab]}
            onPress={() => setActiveTab('history')}
          >
            <History size={16} color={activeTab === 'history' ? colors.primary : colors.mutedForeground} strokeWidth={2.5} />
            <Text style={[styles.tabText, activeTab === 'history' && { color: colors.primary }]}>
              History
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'timer' ? (
             <View style={styles.tabContent}>
              <PomodoroTimer
                state={timerState}
                actions={timerActions}
                TaskSelectorComponent={
                  <TaskSelector
                    tasks={mappedTasks}
                    selectedTaskId={timerState.selectedTaskId}
                    onTaskSelect={(taskId) => timerActions.setSelectedTaskId(taskId)}
                  />
                }
                labels={{
                  stopwatch: 'Stopwatch',
                  pomodoroCount: (count) => `Pomodoro ${count}`,
                  shortBreak: 'Short Break',
                  longBreak: 'Long Break',
                  paused: 'Paused',
                  pauseCount: (count) => `${count} pause${count !== 1 ? 's' : ''}`,
                }}
              />
            </View>
        ) : (
            <SessionHistory sessions={sessions} />
        )}
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
  tabsContainer: {
    padding: 16,
    paddingTop: 10,
  },
  tabsList: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeTab: {
      backgroundColor: colors.muted + '40'
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.mutedForeground,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  tabContent: {
    minHeight: 400,
  },
});

