/**
 * EveningRitualCard for React Native (ODD 006 S2/T5).
 *
 * Parity with packages/ui EveningRitualCard: summary + completed +
 * pending with one-touch destination/reason + complete/skip + shutdown.
 * No date picker: the `date` destination carries the raw YYYY-MM-DD
 * string typed by the user (TZ-safe by construction).
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../ui/text';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { EveningMovePicker } from './evening-move-picker';
import type {
  EveningRitualCardLabels,
  MobileEveningMove,
  MobileEveningTask,
} from './evening-types';

export type {
  EveningRitualCardLabels,
  MobileEveningDestination,
  MobileEveningMove,
  MobileEveningReason,
  MobileEveningTask,
} from './evening-types';

interface EveningRitualCardProps {
  summary: string | null;
  completed: MobileEveningTask[];
  pending: MobileEveningTask[];
  status: 'PENDING' | 'DONE' | 'SKIPPED';
  shutdownComplete: boolean;
  shutdownSuggestion?: string;
  labels: EveningRitualCardLabels;
  onComplete: (moves: MobileEveningMove[]) => void;
  onSkip: () => void;
}

export function EveningRitualCard({
  summary,
  completed,
  pending,
  status,
  shutdownComplete,
  shutdownSuggestion,
  labels,
  onComplete,
  onSkip,
}: EveningRitualCardProps) {
  const [moves, setMoves] = useState<Record<string, MobileEveningMove>>({});

  const moveOf = (taskId: string): MobileEveningMove =>
    moves[taskId] ?? { taskId, destination: 'tomorrow', reason: 'overran' };

  const setMove = (taskId: string, patch: Partial<MobileEveningMove>) =>
    setMoves((prev) => {
      const next = { ...moveOf(taskId), ...patch };
      if (next.destination !== 'date') delete next.date;
      return { ...prev, [taskId]: next };
    });

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>{labels.title}</Text>
      {status !== 'PENDING' && (
        <Text style={styles.status}>
          {status === 'DONE' ? labels.completed : labels.skipped}
        </Text>
      )}
      <Text style={styles.section}>{labels.summaryTitle}</Text>
      <Text style={styles.muted}>{summary ?? labels.summaryEmpty}</Text>
      <Text style={styles.section}>
        {labels.completedTitle}
        {completed.length > 0 ? ` (${completed.length})` : ''}
      </Text>
      {completed.length === 0 ? (
        <Text style={styles.muted}>{labels.completedEmpty}</Text>
      ) : (
        completed.map((task) => (
          <Text key={task.taskId} style={styles.rowTitle}>{task.title}</Text>
        ))
      )}
      <Text style={styles.section}>
        {labels.pendingTitle}
        {pending.length > 0 ? ` (${pending.length})` : ''}
      </Text>
      {pending.length === 0 ? (
        <Text style={styles.muted}>{labels.pendingEmpty}</Text>
      ) : status === 'PENDING' ? (
        pending.map((task) => (
          <EveningMovePicker
            key={task.taskId}
            taskId={task.taskId}
            title={task.title}
            move={moveOf(task.taskId)}
            labels={{
              destinationTomorrow: labels.destinationTomorrow,
              destinationDate: labels.destinationDate,
              destinationArchived: labels.destinationArchived,
              reasonOverran: labels.reasonOverran,
              reasonUrgent: labels.reasonUrgent,
              reasonNoEnergy: labels.reasonNoEnergy,
              reasonOther: labels.reasonOther,
              datePlaceholder: labels.datePlaceholder,
            }}
            onChange={setMove}
          />
        ))
      ) : (
        pending.map((task) => (
          <Text key={task.taskId} style={styles.rowTitle}>{task.title}</Text>
        ))
      )}
      {shutdownComplete && (
        <View style={styles.shutdown}>
          <Text style={styles.rowTitle}>{labels.shutdown}</Text>
          {shutdownSuggestion ? <Text style={styles.muted}>{shutdownSuggestion}</Text> : null}
        </View>
      )}
      {status === 'PENDING' && (
        <View style={styles.buttons}>
          <Button onPress={() => onComplete(pending.map((t) => moveOf(t.taskId)))}>
            <Text>{labels.complete}</Text>
          </Button>
          <Button variant="secondary" onPress={onSkip}>
            <Text>{labels.skip}</Text>
          </Button>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  status: { fontSize: 12, marginBottom: 8 },
  section: { fontSize: 12, fontWeight: '600', marginTop: 8, marginBottom: 4 },
  muted: { fontSize: 12, opacity: 0.7 },
  rowTitle: { fontSize: 14, fontWeight: '500' },
  shutdown: { marginTop: 8 },
  buttons: { flexDirection: 'row', gap: 8, marginTop: 8 },
});
