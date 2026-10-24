import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  runOnJS
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Note } from '@ordo-todo/api-client';
import { useDesignTokens } from '@/app/lib/use-design-tokens';
import { useUpdateNote, useDeleteNote } from '@/app/lib/shared-hooks';

interface NoteCardProps {
  note: Note;
  onDragEnd?: (id: string, x: number, y: number) => void;
  isDraggable?: boolean;
}

export function NoteCard({ note, onDragEnd, isDraggable = true }: NoteCardProps) {
  const { colors } = useDesignTokens();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const [content, setContent] = useState(note.content);

  // Position shared values
  const translateX = useSharedValue(note.x);
  const translateY = useSharedValue(note.y);
  const scale = useSharedValue(1);

  useEffect(() => {
    setContent(note.content);
    translateX.value = note.x;
    translateY.value = note.y;
  }, [note.content, note.x, note.y]);

  // Debounce update to server for content
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content !== note.content) {
        updateNote.mutate({ id: note.id, data: { content } });
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [content]);

  const dragGesture = Gesture.Pan()
    .enabled(isDraggable)
    .onStart(() => {
      scale.value = withSpring(1.05);
    })
    .onUpdate((event) => {
      translateX.value = note.x + event.translationX;
      translateY.value = note.y + event.translationY;
    })
    .onEnd(() => {
      scale.value = withSpring(1);
      if (onDragEnd) {
        runOnJS(onDragEnd)(note.id, translateX.value, translateY.value);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    zIndex: scale.value > 1 ? 100 : 1,
  }));

  const handleDelete = () => {
    deleteNote.mutate(note.id);
  };

  return (
    <GestureDetector gesture={dragGesture}>
      <Animated.View
        style={[
          styles.card,
          { 
            backgroundColor: note.color || '#FEFF9C',
            width: note.width || 200,
            minHeight: note.height || 200,
          },
          animatedStyle,
        ]}
      >
        <View style={styles.header}>
          <View style={styles.dragHandle}>
            <Ionicons name="grid-outline" size={16} color="rgba(0,0,0,0.3)" />
          </View>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
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
          underlineColorAndroid="transparent"
        />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dragHandle: {
    padding: 4,
  },
  deleteButton: {
    padding: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top',
    padding: 0,
  },
});
