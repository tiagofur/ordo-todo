/**
 * MorningRitualCard for React Native (ODD 006 S1/T5).
 *
 * Parity with packages/ui MorningRitualCard: plan blocks + overdue +
 * top-3 selector + complete/skip. Presentational: props + labels +
 * callbacks, no fetching. Hours/date-keys render raw (strings).
 */

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '../ui/text';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

export interface MobileMorningPlanBlock {
  taskId: string;
  title: string;
  start: string;
  end: string;
  reason: string;
}

export interface MobileMorningOverdue {
  taskId: string;
  title: string;
  dueDateKey: string;
}

export interface MorningRitualCardLabels {
  title: string;
  planTitle: string;
  planEmpty: string;
  overdueTitle: string;
  overdueEmpty: string;
  top3Title: string;
  top3Hint: string;
  complete: string;
  skip: string;
  completed: string;
  skipped: string;
}

interface MorningRitualCardProps {
  planBlocks: MobileMorningPlanBlock[];
  overdue: MobileMorningOverdue[];
  suggestedTop3: string[];
  status: 'PENDING' | 'DONE' | 'SKIPPED';
  labels: MorningRitualCardLabels;
  onComplete: (top3: string[]) => void;
  onSkip: () => void;
}

export function MorningRitualCard({
  planBlocks,
  overdue,
  suggestedTop3,
  status,
  labels,
  onComplete,
  onSkip,
}: MorningRitualCardProps) {
  const [selected, setSelected] = useState<string[]>(() =>
    suggestedTop3.filter((id) => planBlocks.some((b) => b.taskId === id)).slice(0, 3),
  );

  const toggle = (taskId: string) => {
    setSelected((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : prev.length >= 3
          ? prev
          : [...prev, taskId],
    );
  };

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>{labels.title}</Text>
      {status !== 'PENDING' && (
        <Text style={styles.status}>
          {status === 'DONE' ? labels.completed : labels.skipped}
        </Text>
      )}
      <Text style={styles.section}>{labels.planTitle}</Text>
      {planBlocks.length === 0 ? (
        <Text style={styles.muted}>{labels.planEmpty}</Text>
      ) : (
        planBlocks.map((block) => (
          <TouchableOpacity
            key={block.taskId}
            style={[styles.row, selected.includes(block.taskId) && styles.rowSelected]}
            onPress={() => status === 'PENDING' && toggle(block.taskId)}
            disabled={status !== 'PENDING'}
          >
            <Text style={styles.rowTitle}>{block.title}</Text>
            <Text style={styles.muted}>{`${block.start} – ${block.end}`}</Text>
            <Text style={styles.muted}>{block.reason}</Text>
          </TouchableOpacity>
        ))
      )}
      <Text style={styles.section}>
        {labels.overdueTitle}
        {overdue.length > 0 ? ` (${overdue.length})` : ''}
      </Text>
      {overdue.length === 0 ? (
        <Text style={styles.muted}>{labels.overdueEmpty}</Text>
      ) : (
        overdue.map((task) => (
          <View key={task.taskId} style={styles.overdueRow}>
            <Text style={styles.rowTitle}>{task.title}</Text>
            <Text style={styles.muted}>{task.dueDateKey}</Text>
          </View>
        ))
      )}
      {status === 'PENDING' && (
        <View style={styles.actions}>
          <Text style={styles.muted}>
            {`${labels.top3Title} · ${labels.top3Hint} (${selected.length}/3)`}
          </Text>
          <View style={styles.buttons}>
            <Button onPress={() => onComplete(selected)} disabled={selected.length === 0}>
              <Text>{labels.complete}</Text>
            </Button>
            <Button variant="secondary" onPress={onSkip}>
              <Text>{labels.skip}</Text>
            </Button>
          </View>
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
  row: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  rowSelected: { backgroundColor: '#eef2ff' },
  rowTitle: { fontSize: 14, fontWeight: '500' },
  overdueRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  actions: { marginTop: 8, gap: 8 },
  buttons: { flexDirection: 'row', gap: 8 },
});
