import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown, LinearTransition, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { useThemeColors } from '@/app/data/hooks/use-theme-colors.hook';
import { useAIInsights } from '@/app/lib/shared-hooks';
import { LinearGradient } from 'expo-linear-gradient';

// Type mapping consistent with Desktop/Web
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

export function MiniAIInsightsWidget() {
  const colors = useThemeColors();
  const { data, isLoading } = useAIInsights();
  const [expanded, setExpanded] = useState(false);

  const insights = (Array.isArray((data as any)?.insights) ? (data as any).insights : []) as any[];
  
  if (isLoading || insights.length === 0) return null;

  // Show only top insight
  const topInsight = insights[0];
  const config = TYPE_CONFIG[topInsight.type] || TYPE_CONFIG.DEFAULT;

  return (
    <Animated.View 
      entering={FadeInDown.delay(300)} 
      layout={LinearTransition.springify().damping(15)}
      style={styles.container}
    >
      <LinearGradient
        colors={[`${config.color}15`, `${config.color}05`]}
        style={[styles.card, { borderColor: `${config.color}30` }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Pressable 
            onPress={() => setExpanded(!expanded)} 
            style={({pressed}) => [styles.content, { opacity: pressed ? 0.9 : 1 }]}
        >
          <View style={[styles.iconContainer, { backgroundColor: `${config.color}20` }]}>
            <Feather name={config.icon as any} size={20} color={config.color} />
          </View>
          
          <View style={styles.textContainer}>
            <View style={styles.headerRow}>
               {/* Chip Design for Label */}
               <View style={[styles.badge, { backgroundColor: `${config.color}15`, borderColor: `${config.color}20` }]}>
                 <Text style={[styles.typeLabel, { color: config.color }]}>{config.label}</Text>
               </View>
               
               <Feather name={expanded ? "chevron-up" : "chevron-down"} size={16} color={colors.textMuted} />
            </View>
            
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={expanded ? undefined : 1}>
              {topInsight.title}
            </Text>
            
            {expanded && (
               <Animated.View entering={ZoomIn.duration(200)} exiting={ZoomOut.duration(200)}>
                   <Text style={[styles.description, { color: colors.textSecondary }]}>
                      {topInsight.description}
                   </Text>
                   
                   {topInsight.actionUrl && (
                      <View style={{marginTop: 8, flexDirection: 'row', alignItems: 'center'}}>
                          <Text style={{fontSize: 12, fontWeight: '600', color: config.color}}>Ver detalles</Text>
                          <Feather name="arrow-right" size={12} color={config.color} style={{marginLeft: 4}} />
                      </View>
                   )}
               </Animated.View>
            )}
            
            {!expanded && insights.length > 1 && (
                <Text style={[styles.moreCount, { color: colors.textMuted }]}>
                    +{insights.length - 1} más para revisar
                </Text>
            )}
          </View>
        </Pressable>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    padding: 16,
    gap: 14,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20, // Circular icon container
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  typeLabel: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  description: {
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  moreCount: {
    fontSize: 11,
    marginTop: 6,
    fontWeight: '500',
  }
});
