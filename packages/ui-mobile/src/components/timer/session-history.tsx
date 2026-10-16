/**
 * Session History Component - Mobile Version
 *
 * Displays list of completed timer sessions with statistics.
 */

import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Clock, Calendar } from 'lucide-react-native';

import { Text } from '../ui/text';
import { Card } from '../ui/card';
import { colors } from '@ordo-todo/styles/tokens';

export interface TimerSession {
  id: string;
  startedAt: Date | string;
  endedAt?: Date | string;
  duration?: number; // seconds
  mode?: 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK' | string;
  type?: string;
  task?: {
    id: string;
    title: string;
  };
  wasCompleted: boolean;
}

interface SessionHistoryProps {
  sessions: TimerSession[];
  labels?: {
    title?: string;
    noSessions?: string;
    completed?: string;
    interrupted?: string;
    duration?: (minutes: number) => string;
  };
}

/**
 * Format date for display
 */
function formatDate(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const sessionDate = new Date(date);

  if (sessionDate.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (sessionDate.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return sessionDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }
}

/**
 * Format time for display
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * SessionHistory Component
 */
export function SessionHistory({
  sessions,
  labels = {},
}: SessionHistoryProps) {
  const {
    title = 'Session History',
    noSessions = 'No sessions yet',
    completed = 'Completed',
    interrupted = 'Interrupted',
    duration = (mins: number) => `${mins}m`,
  } = labels;

  const MODE_COLORS = {
    WORK: '#ef4444',
    SHORT_BREAK: '#4ade80',
    LONG_BREAK: '#15803d',
  };

  const renderSession = ({ item }: { item: TimerSession }) => {
    const minutes = Math.round((item.duration || 0) / 60);
    const modeKey = ((item.mode || item.type || 'WORK') as keyof typeof MODE_COLORS);
    const color = MODE_COLORS[modeKey] || MODE_COLORS.WORK;
    const dateObj = typeof item.startedAt === 'string' ? new Date(item.startedAt) : item.startedAt;

    return (
      <Card style={styles.sessionCard}>
        <View style={styles.sessionHeader}>
          <View style={styles.sessionInfo}>
            <View
              style={[
                styles.modeIndicator,
                { backgroundColor: color },
              ]}
            />
            <View style={styles.sessionDetails}>
              <Text style={styles.sessionTitle}>
                {item.task?.title || (item.mode === 'WORK' ? 'Work Session' : 'Break')}
              </Text>
              <Text style={styles.sessionDate}>
                {formatDate(dateObj)} • {formatTime(dateObj)}
              </Text>
            </View>
          </View>
          <Text style={styles.sessionDuration}>
            {duration(minutes)}
          </Text>
        </View>
        <View style={styles.sessionStatus}>
          <Text
            style={[
              styles.statusText,
              { color: item.wasCompleted ? '#10B981' : colors.mutedForeground },
            ]}
          >
            {item.wasCompleted ? completed : interrupted}
          </Text>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      {sessions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Clock size={48} color={colors.mutedForeground} strokeWidth={1.5} />
          <Text style={styles.emptyText}>{noSessions}</Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          renderItem={renderSession}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: 16,
  },
  list: {
    gap: 12,
  },
  sessionCard: {
    padding: 16,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sessionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modeIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  sessionDetails: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  sessionDuration: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.foreground,
  },
  sessionStatus: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
});
