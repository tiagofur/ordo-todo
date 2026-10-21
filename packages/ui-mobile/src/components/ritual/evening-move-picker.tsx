/**
 * EveningMovePicker for React Native (ODD 006 S2/T5).
 *
 * One-touch destination + reason chips for a single pending task.
 * The `date` destination shows a text input for the raw YYYY-MM-DD
 * string (TZ-safe by construction).
 */

import React from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Text } from '../ui/text';
import type {
  MobileEveningDestination,
  MobileEveningMove,
  MobileEveningReason,
} from './evening-types';

export interface EveningMovePickerLabels {
  destinationTomorrow: string;
  destinationDate: string;
  destinationArchived: string;
  reasonOverran: string;
  reasonUrgent: string;
  reasonNoEnergy: string;
  reasonOther: string;
  datePlaceholder: string;
}

interface EveningMovePickerProps {
  taskId: string;
  title: string;
  move: MobileEveningMove;
  labels: EveningMovePickerLabels;
  onChange: (taskId: string, patch: Partial<MobileEveningMove>) => void;
}

export function EveningMovePicker({
  taskId,
  title,
  move,
  labels,
  onChange,
}: EveningMovePickerProps) {
  const destinations: { value: MobileEveningDestination; label: string }[] = [
    { value: 'tomorrow', label: labels.destinationTomorrow },
    { value: 'date', label: labels.destinationDate },
    { value: 'archived', label: labels.destinationArchived },
  ];
  const reasons: { value: MobileEveningReason; label: string }[] = [
    { value: 'overran', label: labels.reasonOverran },
    { value: 'urgent', label: labels.reasonUrgent },
    { value: 'no-energy', label: labels.reasonNoEnergy },
    { value: 'other', label: labels.reasonOther },
  ];

  return (
    <View style={styles.pendingBox}>
      <Text style={styles.rowTitle}>{title}</Text>
      <View
        style={styles.chips}
        accessibilityRole="radiogroup"
        accessibilityLabel={`${title} — destino`}
      >
        {destinations.map((d) => (
          <TouchableOpacity
            key={d.value}
            style={[styles.chip, move.destination === d.value && styles.chipOn]}
            onPress={() => onChange(taskId, { destination: d.value })}
          >
            <Text style={styles.chipText}>{d.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {move.destination === 'date' && (
        <TextInput
          style={styles.input}
          placeholder={labels.datePlaceholder}
          aria-label={labels.datePlaceholder}
          value={move.date ?? ''}
          onChangeText={(date) => onChange(taskId, { date })}
        />
      )}
      <View
        style={styles.chips}
        accessibilityRole="radiogroup"
        accessibilityLabel={`${title} — razón`}
      >
        {reasons.map((r) => (
          <TouchableOpacity
            key={r.value}
            style={[styles.chip, move.reason === r.value && styles.chipOn]}
            onPress={() => onChange(taskId, { reason: r.value })}
          >
            <Text style={styles.chipText}>{r.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rowTitle: { fontSize: 14, fontWeight: '500' },
  pendingBox: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  chip: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: '#f1f1f1' },
  chipOn: { backgroundColor: '#6366f1' },
  chipText: { fontSize: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 8, marginTop: 6, fontSize: 14 },
});
