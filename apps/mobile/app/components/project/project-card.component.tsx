import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeColors } from '@/app/data/hooks/use-theme-colors.hook';
import Card from '../shared/card.component';

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description?: string | null;
    color: string;
    archived: boolean;
    tasksCount?: number;
    completedTasksCount?: number;
  };
  onPress: () => void;
  style?: any;
}

export default function ProjectCard({ project, onPress, style }: ProjectCardProps) {
  const colors = useThemeColors();
  
  // Calculate progress
  const totalTasks = project.tasksCount || 0;
  const completedTasks = project.completedTasksCount || 0;
  const progressPercent = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0;

  const projectColor = project.color || colors.primary;

  return (
    <Card 
      onPress={onPress} 
      style={[
        styles.container, 
        project.archived && { opacity: 0.6 },
        style
      ]}
      padding={0} // Custom padding handling for border strip
    >
      <View style={styles.contentContainer}>
        {/* Left Color Strip */}
        <View style={[styles.colorStrip, { backgroundColor: projectColor }]} />

        <View style={styles.innerContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: `${projectColor}20` }]}>
              <Feather name="folder" size={20} color={projectColor} />
            </View>
            <View style={styles.titleContainer}>
              <Text 
                style={[styles.title, { color: colors.text }]} 
                numberOfLines={1}
              >
                {project.name}
              </Text>
            </View>
          </View>

          {/* Description */}
          {project.description ? (
            <Text 
              style={[styles.description, { color: colors.textSecondary }]} 
              numberOfLines={2}
            >
              {project.description}
            </Text>
          ) : <View style={{ height: 12 }} />} 

          {/* Footer / Stats */}
          <View style={[styles.footer, { borderColor: colors.border }]}>
            {/* Progress Bar */}
            {totalTasks > 0 ? (
              <View style={styles.progressSection}>
                <View style={styles.progressInfo}>
                  <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
                    Progreso
                  </Text>
                  <Text style={[styles.progressPercent, { color: projectColor }]}>
                    {progressPercent}%
                  </Text>
                </View>
                <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
                  <View 
                    style={[
                      styles.progressBarFill, 
                      { 
                        width: `${progressPercent}%`,
                        backgroundColor: projectColor 
                      }
                    ]} 
                  />
                </View>
              </View>
            ) : (
                <View style={styles.emptyState}>
                    <Text style={[styles.emptyStateText, { color: colors.textMuted }]}>
                        Sin tareas
                    </Text>
                </View>
            )}

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Feather name="check-square" size={14} color={colors.textMuted} />
                <Text style={[styles.statText, { color: colors.textSecondary }]}>
                  {completedTasks}/{totalTasks}
                </Text>
              </View>
              
              {project.archived && (
                <View style={[styles.badge, { backgroundColor: colors.textMuted + '20' }]}>
                   <Text style={[styles.badgeText, { color: colors.textMuted }]}>Archivado</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    marginBottom: 16,
  },
  contentContainer: {
    flexDirection: 'row',
  },
  colorStrip: {
    width: 6,
    height: '100%',
  },
  innerContent: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
    minHeight: 20,
  },
  footer: {
    borderTopWidth: 1,
    borderStyle: 'dashed',
    paddingTop: 12,
    gap: 12,
  },
  progressSection: {
    gap: 6,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 12,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  emptyState: {
      marginBottom: 4
  },
  emptyStateText: {
      fontSize: 12,
      fontStyle: 'italic'
  }
});
