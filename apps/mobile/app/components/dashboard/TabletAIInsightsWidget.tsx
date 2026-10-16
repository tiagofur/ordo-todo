/**
 * TabletAIInsightsWidget - Expanded Version for Tablets
 * 
 * Replicates the Web/Desktop AI Insights widget using native components.
 * Displays a list of insights aimed at larger screens.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useThemeColors } from '@/app/data/hooks/use-theme-colors.hook';
import { useAIInsights } from '@/app/lib/shared-hooks';
import { router } from 'expo-router';

// Reusing same configuration
const TYPE_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  "OVERDUE_ALERT": { icon: "alert-circle", color: "#ef4444", label: "Atención" },
  "WORKLOAD_IMBALANCE": { icon: "activity", color: "#f59e0b", label: "Carga" },
  "PEAK_HOUR_TIP": { icon: "sun", color: "#f59e0b", label: "Productividad" },
  "ENERGY_OPTIMIZATION": { icon: "battery-charging", color: "#10b981", label: "Energía" },
  "BREAK_REMINDER": { icon: "coffee", color: "#3b82f6", label: "Descanso" },
  "REST_SUGGESTION": { icon: "moon", color: "#8b5cf6", label: "Descanso" },
  "ACHIEVEMENT_CELEBRATION": { icon: "award", color: "#ec4899", label: "Logro" },
  "STREAK_MOTIVATION": { icon: "zap", color: "#f97316", label: "Racha" },
  "STREAK_MILESTONE": { icon: "award", color: "#ec4899", label: "Hito" },
  "WEEKLY_ACCOMPLISHMENT": { icon: "check-circle", color: "#10b981", label: "Resumen" },
  "DEFAULT": { icon: "cpu", color: "#6366f1", label: "Insight" }
};

interface Insight {
  type: string;
  title: string;
  description: string;
  actionUrl?: string;
}

export function TabletAIInsightsWidget() {
  const colors = useThemeColors();
  const { data, isLoading } = useAIInsights();

  const insights = (Array.isArray((data as any)?.insights) ? (data as any).insights : []) as Insight[];
  
  if (isLoading) {
      return null;
  }

  if (insights.length === 0) {
      // Empty state implementation could go here
      return null;
  }

  // Show up to 3 insights
  const visibleInsights = insights.slice(0, 3);

  return (
    <Animated.View entering={FadeInDown.delay(300)} style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
            <Feather name="cpu" size={18} color={colors.primary} />
            <Text style={[styles.heading, { color: colors.text }]}>AI Insights</Text>
        </View>
        
        {insights.length > 3 && (
            <Pressable onPress={() => router.push('/screens/(internal)/insights' as any)}>
                 <Text style={{fontSize: 12, color: colors.primary, fontWeight: '600'}}>Ver todos</Text>
            </Pressable>
        )}
      </View>

      {/* List */}
      <View style={styles.list}>
        {visibleInsights.map((insight, index) => {
            const config = TYPE_CONFIG[insight.type] || TYPE_CONFIG.DEFAULT;
            return (
                <Animated.View 
                    key={index} 
                    entering={FadeInDown.delay(300 + (index * 100))}
                    style={[styles.item, { borderBottomColor: colors.border, borderBottomWidth: index === visibleInsights.length - 1 ? 0 : 1 }]}
                >
                    <View style={[styles.iconBox, { backgroundColor: `${config.color}15` }]}>
                        <Feather name={config.icon as any} size={16} color={config.color} />
                    </View>
                    <View style={{flex: 1}}>
                        <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2}}>
                            <Text style={[styles.typeLabel, { color: config.color }]}>{config.label}</Text>
                            <Text style={{fontSize: 10, color: colors.textMuted}}>Ahora</Text>
                        </View>
                        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{insight.title}</Text>
                        <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>{insight.description}</Text>
                        
                        {/* Action Link if available */}
                        {insight.actionUrl && (
                             <Pressable style={{marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 4}}>
                                 <Text style={{fontSize: 11, color: colors.primary, fontWeight: '600'}}>Ver detalles</Text>
                                 <Feather name="arrow-right" size={10} color={colors.primary} />
                             </Pressable>
                        )}
                    </View>
                </Animated.View>
            );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  heading: {
    fontSize: 16,
    fontWeight: '700',
  },
  list: {
      gap: 0,
  },
  item: {
      flexDirection: 'row',
      gap: 12,
      paddingVertical: 12,
  },
  iconBox: {
      width: 32,
      height: 32,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
  },
  typeLabel: {
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'uppercase',
  },
  title: {
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 2,
  },
  description: {
      fontSize: 12,
      lineHeight: 16,
  },
});
