/**
 * StreakCard for React Native (ODD 006 S4/T5).
 * Parity with packages/ui StreakCard: read-only current/best streak,
 * next milestone + reached-milestone celebration.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../ui/text';
import { Card } from '../ui/card';

export interface StreakCardLabels {
  title: string;
  days: string;
  best: string;
  nextMilestone: string;
  milestoneReached: string;
  empty: string;
}

interface StreakCardProps {
  current: number;
  longest: number;
  milestones: number[];
  labels: StreakCardLabels;
}

export function StreakCard({ current, longest, milestones, labels }: StreakCardProps) {
  const sorted = [...milestones].sort((a, b) => a - b);
  const reached = sorted.filter((m) => current >= m).pop();
  const next = sorted.find((m) => m > current);

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>{labels.title}</Text>
      {reached !== undefined && current > 0 && (
        <Text style={styles.reached}>{labels.milestoneReached}</Text>
      )}
      {current === 0 && longest === 0 ? (
        <Text style={styles.muted}>{labels.empty}</Text>
      ) : (
        <View style={styles.row}>
          <View>
            <Text style={styles.big}>{current}</Text>
            <Text style={styles.muted}>{labels.days}</Text>
          </View>
          <View>
            <Text style={styles.muted}>{labels.best}</Text>
            <Text style={styles.rowTitle}>{longest}</Text>
            {next !== undefined && (
              <>
                <Text style={styles.muted}>{labels.nextMilestone}</Text>
                <Text style={styles.rowTitle}>{next}</Text>
              </>
            )}
          </View>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  reached: { fontSize: 12, fontWeight: '700', marginBottom: 4 },
  muted: { fontSize: 12, opacity: 0.7 },
  rowTitle: { fontSize: 14, fontWeight: '500' },
  big: { fontSize: 32, fontWeight: '800' },
  row: { flexDirection: 'row', gap: 24 },
});
