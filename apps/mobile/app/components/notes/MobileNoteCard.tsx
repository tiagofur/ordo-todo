import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Note } from '@ordo-todo/api-client';
import { useDesignTokens } from '@/app/lib/use-design-tokens';
import { useUpdateNote, useDeleteNote } from '@/app/lib/shared-hooks';
import debounce from 'lodash/debounce';

interface MobileNoteCardProps {
  note: Note;
}

export function MobileNoteCard({ note }: MobileNoteCardProps) {
  const { colors } = useDesignTokens();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const [content, setContent] = useState(note.content);

  // Sync state if prop changes (e.g. from background refresh)
  useEffect(() => {
    setContent(note.content);
  }, [note.content]);

  // Debounced save
  const saveContent = (newContent: string) => {
    if (newContent !== note.content) {
      updateNote.mutate({ id: note.id, data: { content: newContent } });
    }
  };

  // We use a ref or manual debounce if lodash isn't available, but usually it is or we can implement simple timeout
  // Implementing manual debounce to be safe and avoid extra deps issues if not installed
  useEffect(() => {
    const timer = setTimeout(() => {
        saveContent(content);
    }, 1000);
    return () => clearTimeout(timer);
  }, [content]);

  const handleDelete = () => {
    Alert.alert(
      "Eliminar nota",
      "¿Estás seguro de que quieres eliminar esta nota?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive", 
          onPress: () => deleteNote.mutate(note.id) 
        }
      ]
    );
  };

  return (
    <View style={[styles.card, { backgroundColor: note.color || '#FEFF9C' }]}>
      <View style={styles.header}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={handleDelete} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close-circle" size={20} color="rgba(0,0,0,0.4)" />
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        multiline
        value={content}
        onChangeText={setContent}
        placeholder="Escribe algo..."
        placeholderTextColor="rgba(0,0,0,0.4)"
        scrollEnabled={false} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  input: {
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top',
    padding: 0,
    minHeight: 80,
  },
});
