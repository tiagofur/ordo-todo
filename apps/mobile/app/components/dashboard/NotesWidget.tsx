import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDesignTokens } from '@/app/lib/use-design-tokens';
import { router } from 'expo-router';
import { useNotes } from '@/app/lib/shared-hooks';
import { useWorkspaceStore } from '@/app/lib/stores';

export function NotesWidget() {
  const { colors } = useDesignTokens();
  const { selectedWorkspaceId } = useWorkspaceStore();
  const { data: notes } = useNotes(selectedWorkspaceId || "");

  const noteCount = notes?.length || 0;

  return (
    <Pressable 
      onPress={() => router.push('/screens/(internal)/notes')}
      style={({ pressed }) => [
        styles.container,
        { 
          backgroundColor: colors.card,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }]
        }
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.section.notes + '20' }]}>
        <Ionicons name="journal" size={24} color={colors.section.notes} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.foreground }]}>Notas</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {noteCount === 0 ? 'Sin notas' : `${noteCount} nota${noteCount !== 1 ? 's' : ''}`}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
});
