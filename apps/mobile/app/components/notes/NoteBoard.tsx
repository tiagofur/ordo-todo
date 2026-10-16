import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Note } from '@ordo-todo/api-client';
import { NoteCard } from './NoteCard';
import { useUpdateNote } from '@/app/lib/shared-hooks';

interface NoteBoardProps {
  workspaceId: string;
  notes: Note[];
}

const BOARD_SIZE = 2000;

export function NoteBoard({ workspaceId, notes }: NoteBoardProps) {
  const updateNote = useUpdateNote();

  const handleDragEnd = (id: string, x: number, y: number) => {
    updateNote.mutate({
      id,
      data: { x, y }
    });
  };

  return (
    <ScrollView 
      horizontal 
      style={styles.container}
      contentContainerStyle={{ width: BOARD_SIZE }}
    >
      <ScrollView 
        style={styles.container}
        contentContainerStyle={{ height: BOARD_SIZE }}
      >
        <View style={styles.board}>
          {notes.map((note) => (
            <NoteCard 
              key={note.id} 
              note={note} 
              onDragEnd={handleDragEnd}
            />
          ))}
        </View>
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  board: {
    width: BOARD_SIZE,
    height: BOARD_SIZE,
    backgroundColor: 'transparent',
  },
});
