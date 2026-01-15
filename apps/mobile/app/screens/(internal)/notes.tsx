import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable, FlatList, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDesignTokens } from '@/app/lib/use-design-tokens';
import { useNotes, useCreateNote, useWorkspaces } from '@/app/lib/shared-hooks';
import { useWorkspaceStore } from '@/app/lib/stores';
import { MobileNoteCard } from '@/app/components/notes/MobileNoteCard';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useMediaQuery } from '@/app/lib/hooks/use-media-query';
import { useTranslation } from 'react-i18next';

export default function NotesScreen() {
  const router = useRouter();
  const { colors } = useDesignTokens();
  const { isTablet } = useMediaQuery();
  const { t } = useTranslation();

  const { data: workspaces, isLoading: isLoadingWorkspaces } = useWorkspaces();
  const { selectedWorkspaceId, setSelectedWorkspaceId } = useWorkspaceStore();
  
  useEffect(() => {
    if (workspaces && workspaces.length > 0 && !selectedWorkspaceId) {
      setSelectedWorkspaceId(workspaces[0].id);
    }
  }, [workspaces, selectedWorkspaceId]);

  const effectiveWorkspaceId = selectedWorkspaceId || workspaces?.[0]?.id;
  const { data: notes, isLoading: isLoadingNotes, refetch } = useNotes(effectiveWorkspaceId || "");
  const createNoteMutation = useCreateNote();

  const handleAddNote = () => {
    if (!effectiveWorkspaceId) return;
    createNoteMutation.mutate({
      workspaceId: effectiveWorkspaceId,
      content: '',
      x: 0,
      y: 0,
      color: '#FEFF9C',
      width: 250,
      height: 250,
    });
  };

  if (isLoadingWorkspaces || (isLoadingNotes && effectiveWorkspaceId)) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.section.notes} />
      </View>
    );
  }

  if (!effectiveWorkspaceId) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>No workspace selected.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <FlatList
          data={notes || []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MobileNoteCard note={item} />
          )}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <Animated.View 
              entering={FadeInDown.duration(600)}
              style={styles.headerContainer}
            >
              <View style={styles.headerMain}>
                <View style={[styles.headerIcon, { backgroundColor: colors.section.notes }]}>
                  <Ionicons name="journal" size={24} color="#FFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.headerTitle, { color: colors.foreground }]}>
                    {t('Notes.title', 'Notas')}
                  </Text>
                  <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]} numberOfLines={1}>
                    Captura tus ideas en el tablero
                  </Text>
                </View>
              </View>
            </Animated.View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                No hay notas aún
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.mutedForeground }]}>
                Toca el botón + para crear una
              </Text>
            </View>
          }
        />
      </View>

      {/* FAB */}
      <View style={styles.fabContainer}>
        <Pressable 
          onPress={handleAddNote}
          disabled={createNoteMutation.isPending}
          style={({ pressed }) => [
            styles.fab, 
            { 
              backgroundColor: colors.section.notes,
              opacity: pressed || createNoteMutation.isPending ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.95 : 1 }]
            }
          ]}
        >
          {createNoteMutation.isPending ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Ionicons name="add" size={28} color="#FFF" />
          )}
          <Text style={styles.fabText}>Nueva Nota</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // Space for FAB
  },
  headerContainer: {
    marginBottom: 24,
    marginTop: 8,
  },
  headerMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    left: 30,
    alignItems: 'center',
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 24,
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    gap: 8,
  },
  fabText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
  },
});

