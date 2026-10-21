/**
 * TimeboxCard for React Native (ODD 006 S3/T5).
 *
 * Parity with packages/ui TimeboxCard: top-3 with editable HH:mm
 * blocks (plain text inputs; strings, TZ-safe) + accept proposal.
 */

import React, { useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { Text } from '../ui/text';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

export interface MobileTimeboxTask {
  taskId: string;
  title: string;
  start: string;
  end: string;
}

export interface MobileTimeboxBlock {
  taskId: string;
  start: string;
  end: string;
}

export interface TimeboxCardLabels {
  title: string;
  empty: string;
  startLabel: string;
  endLabel: string;
  save: string;
  acceptProposal: string;
}

interface TimeboxCardProps {
  top3: MobileTimeboxTask[];
  labels: TimeboxCardLabels;
  onSave: (blocks: MobileTimeboxBlock[]) => void;
  onAcceptProposal: () => void;
}

export function TimeboxCard({ top3, labels, onSave, onAcceptProposal }: TimeboxCardProps) {
  const [times, setTimes] = useState<Record<string, { start: string; end: string }>>({});

  const timeOf = (task: MobileTimeboxTask) =>
    times[task.taskId] ?? { start: task.start, end: task.end };

  const setTime = (taskId: string, patch: { start?: string; end?: string }) =>
    setTimes((prev) => {
      const base = prev[taskId] ?? {
        start: top3.find((t) => t.taskId === taskId)?.start ?? '',
        end: top3.find((t) => t.taskId === taskId)?.end ?? '',
      };
      return { ...prev, [taskId]: { ...base, ...patch } };
    });

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>{labels.title}</Text>
      {top3.length === 0 ? (
        <Text style={styles.muted}>{labels.empty}</Text>
      ) : (
        <View>
          {top3.map((task) => {
            const time = timeOf(task);
            return (
              <View key={task.taskId} style={styles.block}>
                <Text style={styles.rowTitle}>{task.title}</Text>
                <View style={styles.inputs}>
                  <Text style={styles.muted}>{labels.startLabel}</Text>
                  <TextInput
                    style={styles.input}
                    value={time.start}
                    onChangeText={(start) => setTime(task.taskId, { start })}
                    placeholder="09:00"
                  />
                  <Text style={styles.muted}>{labels.endLabel}</Text>
                  <TextInput
                    style={styles.input}
                    value={time.end}
                    onChangeText={(end) => setTime(task.taskId, { end })}
                    placeholder="10:00"
                  />
                </View>
              </View>
            );
          })}
          <View style={styles.buttons}>
            <Button onPress={() => onSave(top3.map((t) => ({ taskId: t.taskId, ...timeOf(t) })))}>
              <Text>{labels.save}</Text>
            </Button>
            <Button variant="secondary" onPress={onAcceptProposal}>
              <Text>{labels.acceptProposal}</Text>
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
  muted: { fontSize: 12, opacity: 0.7 },
  rowTitle: { fontSize: 14, fontWeight: '500' },
  block: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  inputs: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 8, fontSize: 14, minWidth: 70 },
  buttons: { flexDirection: 'row', gap: 8, marginTop: 8 },
});
