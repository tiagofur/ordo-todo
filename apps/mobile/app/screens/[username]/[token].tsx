/**
 * Shared Task Screen - Mobile
 *
 * Public view of a shared task without authentication
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  Tag,
  User,
  Share2,
  Lock,
} from 'lucide-react-native';

import { Text } from '@ordo-todo/ui-mobile';
import { colors } from '@ordo-todo/styles/tokens';
import { useRouter, useLocalSearchParams } from 'expo-router';

interface SharedTask {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: Date;
  createdAt: Date;
  project?: {
    id: string;
    name: string;
    color: string;
  };
  tags?: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  sharedBy: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export default function SharedTaskScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { username, token } = params as { username: string; token: string };

  const [task, setTask] = useState<SharedTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch shared task
  useEffect(() => {
    fetchSharedTask();
  }, [username, token]);

  const fetchSharedTask = async () => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Replace with actual API call
      // const response = await fetch(`/api/shared/${username}/${token}`);
      // const data = await response.json();
      // setTask(data);

      // Mock data for now
      setTimeout(() => {
        setTask({
          id: '1',
          title: 'Review project proposal',
          description:
            'Review the project proposal document and provide feedback on the timeline, budget, and deliverables.',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          project: {
            id: '1',
            name: 'Q1 Planning',
            color: '#3B82F6',
          },
          tags: [
            { id: '1', name: 'Planning', color: '#8B5CF6' },
            { id: '2', name: 'Important', color: '#EF4444' },
          ],
          sharedBy: {
            id: 'user-1',
            name: 'John Doe',
          },
        });
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to load shared task');
      setLoading(false);
    }
  };

  const handleCopyLink = useCallback(() => {
    const link = `https://ordo.todo/shared/${username}/${token}`;
    // TODO: Implement clipboard copy
    Alert.alert('Link Copied', link);
  }, [username, token]);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'HIGH':
        return '#EF4444';
      case 'MEDIUM':
        return '#F59E0B';
      case 'LOW':
        return '#10B981';
      default:
        return colors.mutedForeground;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DONE':
        return <CheckCircle2 size={24} color={colors.success} strokeWidth={2.5} />;
      case 'IN_PROGRESS':
        return <Circle size={24} color={colors.warning} strokeWidth={2} fill={colors.warning} />;
      default:
        return <Circle size={24} color={colors.mutedForeground} strokeWidth={2} />;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading shared task...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !task) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Lock size={48} color={colors.mutedForeground} strokeWidth={1.5} />
          <Text style={styles.errorTitle}>Task Not Found</Text>
          <Text style={styles.errorText}>
            This shared task link may have expired or is invalid.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            {getStatusIcon(task.status)}
            <View style={styles.headerText}>
              <Text style={styles.title}>{task.title}</Text>
              <Text style={styles.sharedBy}>
                Shared by {task.sharedBy.name}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleCopyLink}
            style={styles.shareButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Share2 size={20} color={colors.primary} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Description */}
        {task.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{task.description}</Text>
          </View>
        )}

        {/* Metadata */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>

          {/* Status */}
          <View style={styles.detailRow}>
            <View style={[styles.detailIcon, { backgroundColor: colors.accent }]}>
              <CheckCircle2 size={18} color={colors.accentForeground} strokeWidth={2.5} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Status</Text>
              <Text style={styles.detailValue}>
                {task.status.replace('_', ' ')}
              </Text>
            </View>
          </View>

          {/* Priority */}
          <View style={styles.detailRow}>
            <View
              style={[
                styles.detailIcon,
                { backgroundColor: getPriorityColor(task.priority) + '20' },
              ]}
            >
              <Tag
                size={18}
                color={getPriorityColor(task.priority)}
                strokeWidth={2.5}
              />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Priority</Text>
              <Text
                style={[styles.detailValue, { color: getPriorityColor(task.priority) }]}
              >
                {task.priority}
              </Text>
            </View>
          </View>

          {/* Due Date */}
          {task.dueDate && (
            <View style={styles.detailRow}>
              <View style={[styles.detailIcon, { backgroundColor: colors.accent }]}>
                <Calendar size={18} color={colors.accentForeground} strokeWidth={2.5} />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Due Date</Text>
                <Text style={styles.detailValue}>{formatDate(task.dueDate)}</Text>
              </View>
            </View>
          )}

          {/* Created Date */}
          <View style={styles.detailRow}>
            <View style={[styles.detailIcon, { backgroundColor: colors.accent }]}>
              <Clock size={18} color={colors.accentForeground} strokeWidth={2.5} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Created</Text>
              <Text style={styles.detailValue}>{formatDate(task.createdAt)}</Text>
            </View>
          </View>
        </View>

        {/* Project */}
        {task.project && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Project</Text>
            <View
              style={[
                styles.projectCard,
                { borderLeftColor: task.project.color },
              ]}
            >
              <Text style={styles.projectName}>{task.project.name}</Text>
            </View>
          </View>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
              {task.tags.map((tag) => (
                <View
                  key={tag.id}
                  style={[styles.tag, { backgroundColor: tag.color + '20' }]}
                >
                  <Text style={[styles.tagText, { color: tag.color }]}>
                    {tag.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* CTA */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity style={styles.ctaButton}>
          <Text style={styles.ctaButtonText}>Open in Ordo App</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.mutedForeground,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.foreground,
  },
  errorText: {
    fontSize: 16,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: 4,
  },
  sharedBy: {
    fontSize: 14,
    color: colors.mutedForeground,
  },
  shareButton: {
    padding: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.foreground,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.foreground,
  },
  projectCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    padding: 16,
  },
  projectName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
