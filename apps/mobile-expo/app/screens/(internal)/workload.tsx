import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Pressable,
  FlatList,
  Platform,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInRight,
  Layout,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '@/app/data/hooks/use-theme-colors.hook';
import Card from '@/app/components/shared/card.component';
import { apiClient } from '@/app/lib/api-client';
import { useWorkspaces } from '@/app/lib/shared-hooks';
import { useTranslation } from 'react-i18next';

interface MemberWorkload {
  userId: string;
  userName: string;
  userEmail: string;
  avatarUrl?: string;
  workloadScore: number;
  assignedTasks: number;
  completedTasks: number;
  hoursWorkedThisWeek: number;
  trend: 'INCREASING' | 'STABLE' | 'DECREASING';
  workloadLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'OVERLOADED';
}

interface WorkloadSuggestion {
  type: 'REDISTRIBUTE' | 'URGENT_HELP' | 'BALANCE';
  reason: string;
  fromUserName?: string;
  toUserName?: string;
  taskCount?: number;
}

interface TeamWorkloadData {
  workspaceId: string;
  workspaceName: string;
  members: MemberWorkload[];
  averageWorkload: number;
  balanceScore?: number;
  redistributionSuggestions: WorkloadSuggestion[];
}

export default function WorkloadScreen() {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [workloadData, setWorkloadData] = useState<TeamWorkloadData | null>(null);
  const [showWorkspacePicker, setShowWorkspacePicker] = useState(false);

  const { data: workspaces = [] } = useWorkspaces();

  const fetchWorkload = async (workspaceId: string) => {
    try {
      const data = await apiClient.getWorkspaceWorkload(workspaceId);
      setWorkloadData(data as any);
    } catch (error) {
      console.error('Failed to fetch workload:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (workspaces.length > 0 && !selectedWorkspaceId) {
      setSelectedWorkspaceId(workspaces[0].id);
    }
  }, [workspaces, selectedWorkspaceId]);

  useEffect(() => {
    if (selectedWorkspaceId) {
      fetchWorkload(selectedWorkspaceId);
    } else {
      setIsLoading(false);
    }
  }, [selectedWorkspaceId]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (selectedWorkspaceId) {
      fetchWorkload(selectedWorkspaceId);
    }
  }, [selectedWorkspaceId]);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'LOW': return colors.primary;
      case 'MODERATE': return colors.success;
      case 'HIGH': return colors.warning;
      case 'OVERLOADED': return colors.error;
      default: return colors.textMuted;
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'LOW': return 'Disponible';
      case 'MODERATE': return 'Óptimo';
      case 'HIGH': return 'Ocupado';
      case 'OVERLOADED': return 'Sobrecargado';
      default: return status;
    }
  };

  const getTrendIcon = (trend: string): { icon: 'trending-up' | 'trending-down' | 'minus'; color: string } => {
    switch (trend) {
      case 'INCREASING': return { icon: 'trending-up', color: colors.error };
      case 'DECREASING': return { icon: 'trending-down', color: colors.success };
      default: return { icon: 'minus', color: '#facc15' };
    }
  };

  const selectedWorkspace = workspaces.find((ws: any) => ws.id === selectedWorkspaceId);

  const handleWorkspaceSelect = (workspaceId: string) => {
    if (Platform.OS === 'ios') {
      Haptics.selectionAsync();
    }
    setSelectedWorkspaceId(workspaceId);
    setShowWorkspacePicker(false);
    setIsLoading(true);
  };

  const renderMember = ({ item, index }: { item: MemberWorkload; index: number }) => {
    const statusColor = getStatusColor(item.workloadLevel);
    const trendInfo = getTrendIcon(item.trend);

    return (
      <Animated.View 
        entering={FadeInRight.delay(index * 100).springify()} 
        layout={Layout.springify()}
      >
        <Pressable
          onPress={() => {
            if (Platform.OS === 'ios') {
              Haptics.selectionAsync();
            }
          }}
        >
          <Card style={styles.memberCard}>
            {/* Avatar */}
            <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.avatarText, { color: colors.primary }]}>
                {item.userName?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>

            {/* Info */}
            <View style={styles.memberInfo}>
              <View style={styles.memberNameRow}>
                <Text style={[styles.memberName, { color: colors.text }]} numberOfLines={1}>
                  {item.userName}
                </Text>
                <Feather name={trendInfo.icon} size={14} color={trendInfo.color} />
              </View>
              <Text style={[styles.memberEmail, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.userEmail}
              </Text>

              {/* Stats Row */}
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={[styles.statValue, { color: colors.text }]}>{item.assignedTasks}</Text>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>asig.</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={[styles.statValue, { color: colors.success }]}>{item.completedTasks}</Text>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>comp.</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={[styles.statValue, { color: colors.text }]}>{item.hoursWorkedThisWeek}h</Text>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>esta sem.</Text>
                </View>
              </View>
            </View>

            {/* Workload Badge */}
            <View style={styles.workloadColumn}>
              <View style={[styles.workloadBadge, { backgroundColor: statusColor + '20' }]}>
                <Text style={[styles.workloadScore, { color: statusColor }]}>{item.workloadScore}%</Text>
              </View>
              <Text style={[styles.workloadStatus, { color: statusColor }]}>
                {getStatusLabel(item.workloadLevel)}
              </Text>
            </View>
          </Card>
        </Pressable>
      </Animated.View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Cargando carga del equipo...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={['#f97316', '#fb923c']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View entering={FadeInDown.delay(100)}>
          <Text style={styles.greeting}>Gestión de</Text>
          <Text style={styles.title}>Carga de Trabajo</Text>
        </Animated.View>

        {/* Workspace Selector */}
        <Animated.View entering={FadeInDown.delay(200)}>
          <Pressable 
            style={styles.workspaceSelector}
            onPress={() => {
              if (Platform.OS === 'ios') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              setShowWorkspacePicker(!showWorkspacePicker);
            }}
          >
            <Feather name="briefcase" size={16} color="#fff" />
            <Text style={styles.workspaceName}>{selectedWorkspace?.name || 'Seleccionar'}</Text>
            <Feather name="chevron-down" size={16} color="#fff" />
          </Pressable>
        </Animated.View>

        {/* Workspace Picker Dropdown */}
        {showWorkspacePicker && (
          <Animated.View 
            entering={FadeInDown.springify()} 
            style={[styles.workspaceDropdown, { backgroundColor: colors.card }]}
          >
            {workspaces.map((ws: any) => (
              <Pressable
                key={ws.id}
                style={[
                  styles.workspaceOption,
                  ws.id === selectedWorkspaceId && { backgroundColor: colors.primary + '20' }
                ]}
                onPress={() => handleWorkspaceSelect(ws.id)}
              >
                <Text style={[
                  styles.workspaceOptionText, 
                  { color: ws.id === selectedWorkspaceId ? colors.primary : colors.text }
                ]}>
                  {ws.name}
                </Text>
                {ws.id === selectedWorkspaceId && (
                  <Feather name="check" size={16} color={colors.primary} />
                )}
              </Pressable>
            ))}
          </Animated.View>
        )}

        {/* Quick Stats */}
        {workloadData && (
          <Animated.View entering={FadeInDown.delay(300)} style={styles.quickStats}>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatValue}>{workloadData.members.length}</Text>
              <Text style={styles.quickStatLabel}>Miembros</Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStat}>
              <Text style={styles.quickStatValue}>{workloadData.averageWorkload}%</Text>
              <Text style={styles.quickStatLabel}>Carga prom.</Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStat}>
              <Text style={styles.quickStatValue}>{workloadData.balanceScore ?? 100}%</Text>
              <Text style={styles.quickStatLabel}>Balance</Text>
            </View>
          </Animated.View>
        )}
      </LinearGradient>

      {workloadData ? (
        <FlatList
          data={workloadData.members}
          keyExtractor={(item) => item.userId}
          renderItem={renderMember}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListHeaderComponent={
            /* AI Suggestions */
            workloadData.redistributionSuggestions && workloadData.redistributionSuggestions.length > 0 ? (
              <Animated.View entering={FadeInDown.delay(400).springify()}>
                <Card style={styles.suggestionsCard}>
                  <View style={styles.suggestionsHeader}>
                    <Feather name="zap" size={18} color="#f97316" />
                    <Text style={[styles.suggestionsTitle, { color: colors.text }]}>
                      Sugerencias de IA
                    </Text>
                  </View>
                  {workloadData.redistributionSuggestions.slice(0, 3).map((suggestion, idx) => (
                    <View key={idx} style={styles.suggestionItem}>
                      <View style={[styles.suggestionIcon, { backgroundColor: '#f97316' + '20' }]}>
                        <Feather name="repeat" size={14} color="#f97316" />
                      </View>
                      <View style={styles.suggestionContent}>
                        <Text style={[styles.suggestionText, { color: colors.text }]}>
                          {suggestion.reason}
                        </Text>
                        {suggestion.fromUserName && suggestion.toUserName && (
                          <Text style={[styles.suggestionMeta, { color: colors.textSecondary }]}>
                            {suggestion.fromUserName} → {suggestion.toUserName}
                            {suggestion.taskCount ? ` (${suggestion.taskCount} tareas)` : ''}
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                </Card>
              </Animated.View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="users" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Sin miembros</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No hay miembros en este workspace
              </Text>
            </View>
          }
          ListFooterComponent={<View style={{ height: 100 }} />}
        />
      ) : (
        <View style={[styles.emptyContainer, { flex: 1 }]}>
          <Feather name="briefcase" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            {workspaces.length === 0 ? 'No hay workspaces' : 'Selecciona un workspace'}
          </Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {workspaces.length === 0 
              ? 'Crea un workspace para ver la carga del equipo' 
              : 'Elige un workspace para ver la carga de trabajo'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  greeting: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    opacity: 0.9,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: -1,
  },
  workspaceSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  workspaceName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  workspaceDropdown: {
    position: 'absolute',
    top: 130,
    left: 20,
    right: 20,
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
  },
  workspaceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
  },
  workspaceOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  quickStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  quickStat: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  quickStatLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  quickStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 12,
  },
  listContent: {
    padding: 20,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  memberEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 10,
  },
  workloadColumn: {
    alignItems: 'center',
    marginLeft: 12,
  },
  workloadBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 4,
  },
  workloadScore: {
    fontSize: 14,
    fontWeight: '800',
  },
  workloadStatus: {
    fontSize: 10,
    fontWeight: '600',
  },
  suggestionsCard: {
    marginBottom: 16,
    padding: 16,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  suggestionsTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  suggestionIcon: {
    padding: 6,
    borderRadius: 8,
    marginRight: 10,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  suggestionMeta: {
    fontSize: 11,
    marginTop: 4,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});
