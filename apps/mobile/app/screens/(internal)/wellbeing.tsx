import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Pressable,
  Vibration,
  Platform,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '@/app/data/hooks/use-theme-colors.hook';
import Card from '@/app/components/shared/card.component';
import { apiClient } from '@/app/lib/api-client';
import { useTranslation } from 'react-i18next';

interface BurnoutAnalysis {
  riskScore: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  warnings: {
    type: string;
    severity: 'MILD' | 'MODERATE' | 'SEVERE';
    message: string;
    recommendation: string;
  }[];
  aiInsights?: string;
}

interface WorkPattern {
  averageHoursPerDay: number;
  nightWorkPercentage: number;
  weekendWorkPercentage: number;
  longSessionsCount: number;
  averageBreakMinutes: number;
  consistencyScore: number;
}

interface WeeklySummary {
  overallScore: number;
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
  highlights: string[];
  concerns: string[];
  recommendations: string[];
}

export default function WellbeingScreen() {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [burnout, setBurnout] = useState<BurnoutAnalysis | null>(null);
  const [patterns, setPatterns] = useState<WorkPattern | null>(null);
  const [weekly, setWeekly] = useState<WeeklySummary | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const energyScale = useSharedValue(1);

  const fetchData = async () => {
    try {
      const [burnoutRes, patternsRes, weeklyRes, recsRes] = await Promise.allSettled([
        apiClient.getBurnoutAnalysis(),
        apiClient.getWorkPatterns(),
        apiClient.getWeeklyWellbeingSummary(),
        apiClient.getRestRecommendations(),
      ]);

      if (burnoutRes.status === 'fulfilled') setBurnout(burnoutRes.value);
      if (patternsRes.status === 'fulfilled') setPatterns(patternsRes.value);
      if (weeklyRes.status === 'fulfilled') setWeekly(weeklyRes.value);
      if (recsRes.status === 'fulfilled') setRecommendations(Array.isArray(recsRes.value) ? recsRes.value : []);
    } catch (error) {
      console.error('Failed to fetch wellbeing data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    fetchData();
  }, []);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW': return colors.success;
      case 'MODERATE': return '#facc15';
      case 'HIGH': return colors.warning;
      case 'CRITICAL': return colors.error;
      default: return colors.primary;
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'LOW': return 'Bajo';
      case 'MODERATE': return 'Moderado';
      case 'HIGH': return 'Alto';
      case 'CRITICAL': return 'Crítico';
      default: return level;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'IMPROVING': return { icon: 'trending-up' as const, color: colors.success };
      case 'DECLINING': return { icon: 'trending-down' as const, color: colors.error };
      default: return { icon: 'minus' as const, color: '#facc15' };
    }
  };

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case 'IMPROVING': return 'Mejorando';
      case 'STABLE': return 'Estable';
      case 'DECLINING': return 'Bajando';
      default: return trend;
    }
  };

  const animatedEnergyStyle = useAnimatedStyle(() => ({
    transform: [{ scale: energyScale.value }],
  }));

  const handleEnergyPress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Vibration.vibrate(50);
    }
    energyScale.value = withSpring(1.05, { damping: 10 }, () => {
      energyScale.value = withSpring(1);
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Analizando tu bienestar...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={['#ec4899', '#f472b6']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View entering={FadeInDown.delay(100)}>
          <Text style={styles.greeting}>Tu espacio de</Text>
          <Text style={styles.title}>Bienestar</Text>
        </Animated.View>

        {/* Energy Level - Mobile Feature */}
        {weekly && (
          <Animated.View entering={FadeInDown.delay(200)}>
            <Pressable onPress={handleEnergyPress}>
              <Animated.View style={[styles.energyCard, animatedEnergyStyle]}>
                <View style={styles.energyContent}>
                  <View style={styles.energyIconContainer}>
                    <Feather name="battery-charging" size={28} color="#fff" />
                  </View>
                  <View style={styles.energyTextContainer}>
                    <Text style={styles.energyLabel}>Nivel de Energía</Text>
                    <View style={styles.energyScoreRow}>
                      <Text style={styles.energyScore}>{weekly.overallScore}</Text>
                      <Text style={styles.energyMax}>/100</Text>
                    </View>
                  </View>
                  <View style={styles.trendContainer}>
                    <Feather 
                      name={getTrendIcon(weekly.trend).icon} 
                      size={20} 
                      color={getTrendIcon(weekly.trend).color} 
                    />
                    <Text style={[styles.trendLabel, { color: getTrendIcon(weekly.trend).color }]}>
                      {getTrendLabel(weekly.trend)}
                    </Text>
                  </View>
                </View>
                {/* Progress Bar */}
                <View style={styles.energyProgressBg}>
                  <View style={[styles.energyProgress, { width: `${weekly.overallScore}%` }]} />
                </View>
              </Animated.View>
            </Pressable>
          </Animated.View>
        )}
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Burnout Risk */}
        {burnout && (
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <Card style={styles.riskCard}>
              <View style={styles.riskHeader}>
                <View style={styles.riskTitleRow}>
                  <Feather name="activity" size={20} color={colors.text} />
                  <Text style={[styles.cardTitle, { color: colors.text }]}>Riesgo de Burnout</Text>
                </View>
                <View style={[styles.riskBadge, { backgroundColor: getRiskColor(burnout.riskLevel) + '20' }]}>
                  <Text style={[styles.riskBadgeText, { color: getRiskColor(burnout.riskLevel) }]}>
                    {getRiskLabel(burnout.riskLevel)}
                  </Text>
                </View>
              </View>

              {/* Score Circle */}
              <View style={styles.scoreCircleContainer}>
                <View style={[styles.scoreCircle, { borderColor: getRiskColor(burnout.riskLevel) }]}>
                  <Text style={[styles.scoreText, { color: colors.text }]}>{burnout.riskScore}</Text>
                  <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>puntos</Text>
                </View>
              </View>

              {/* Warnings */}
              {burnout.warnings && burnout.warnings.length > 0 && (
                <View style={styles.warningsContainer}>
                  <Text style={[styles.warningsTitle, { color: colors.text }]}>Factores detectados</Text>
                  {burnout.warnings.slice(0, 3).map((warning, idx) => (
                    <View key={idx} style={styles.warningItem}>
                      <Feather 
                        name={warning.severity === 'SEVERE' ? 'alert-triangle' : 'info'} 
                        size={16} 
                        color={warning.severity === 'SEVERE' ? colors.error : colors.warning} 
                      />
                      <Text style={[styles.warningText, { color: colors.textSecondary }]}>
                        {warning.message}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </Card>
          </Animated.View>
        )}

        {/* Work Patterns Grid - Mobile optimized */}
        {patterns && (
          <Animated.View entering={FadeInRight.delay(400).springify()}>
            <View style={styles.patternsGrid}>
              <Card style={styles.patternCard}>
                <View style={[styles.patternIcon, { backgroundColor: colors.primary + '20' }]}>
                  <Feather name="clock" size={20} color={colors.primary} />
                </View>
                <Text style={[styles.patternValue, { color: colors.text }]}>
                  {patterns.averageHoursPerDay.toFixed(1)}h
                </Text>
                <Text style={[styles.patternLabel, { color: colors.textSecondary }]}>Horas/día</Text>
              </Card>
              <Card style={styles.patternCard}>
                <View style={[styles.patternIcon, { backgroundColor: '#8b5cf6' + '20' }]}>
                  <Feather name="moon" size={20} color="#8b5cf6" />
                </View>
                <Text style={[styles.patternValue, { color: colors.text }]}>
                  {patterns.nightWorkPercentage}%
                </Text>
                <Text style={[styles.patternLabel, { color: colors.textSecondary }]}>Nocturno</Text>
              </Card>
              <Card style={styles.patternCard}>
                <View style={[styles.patternIcon, { backgroundColor: colors.warning + '20' }]}>
                  <Feather name="calendar" size={20} color={colors.warning} />
                </View>
                <Text style={[styles.patternValue, { color: colors.text }]}>
                  {patterns.weekendWorkPercentage}%
                </Text>
                <Text style={[styles.patternLabel, { color: colors.textSecondary }]}>Fines semana</Text>
              </Card>
              <Card style={styles.patternCard}>
                <View style={[styles.patternIcon, { backgroundColor: colors.success + '20' }]}>
                  <Feather name="coffee" size={20} color={colors.success} />
                </View>
                <Text style={[styles.patternValue, { color: colors.text }]}>
                  {patterns.averageBreakMinutes}m
                </Text>
                <Text style={[styles.patternLabel, { color: colors.textSecondary }]}>Descansos</Text>
              </Card>
            </View>
          </Animated.View>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <Animated.View entering={FadeInDown.delay(500).springify()}>
            <Card style={styles.recommendationsCard}>
              <View style={styles.recommendationsHeader}>
                <Feather name="heart" size={20} color="#ec4899" />
                <Text style={[styles.cardTitle, { color: colors.text }]}>Recomendaciones</Text>
              </View>
              {recommendations.slice(0, 4).map((rec, idx) => (
                <Pressable 
                  key={idx} 
                  style={styles.recommendationItem}
                  onPress={() => {
                    if (Platform.OS === 'ios') {
                      Haptics.selectionAsync();
                    }
                  }}
                >
                  <View style={[styles.recIcon, { backgroundColor: '#ec4899' + '20' }]}>
                    <Feather name="zap" size={16} color="#ec4899" />
                  </View>
                  <View style={styles.recContent}>
                    <Text style={[styles.recMessage, { color: colors.text }]}>{rec.message}</Text>
                    {rec.suggestedAction && (
                      <Text style={[styles.recAction, { color: colors.textSecondary }]}>
                        {rec.suggestedAction}
                      </Text>
                    )}
                  </View>
                  <Feather name="chevron-right" size={16} color={colors.textMuted} />
                </Pressable>
              ))}
            </Card>
          </Animated.View>
        )}

        {/* Weekly Summary Quick Tips */}
        {weekly && weekly.recommendations && weekly.recommendations.length > 0 && (
          <Animated.View entering={FadeInDown.delay(600).springify()}>
            <Card style={[styles.tipCard, { backgroundColor: '#ec4899' + '15' }]}>
              <View style={styles.tipContent}>
                <Feather name="star" size={24} color="#ec4899" />
                <Text style={[styles.tipText, { color: colors.text }]}>
                  {weekly.recommendations[0]}
                </Text>
              </View>
            </Card>
          </Animated.View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
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
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 20,
    letterSpacing: -1,
  },
  energyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 16,
  },
  energyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  energyIconContainer: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  energyTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  energyLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  energyScoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  energyScore: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  energyMax: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 2,
  },
  trendContainer: {
    alignItems: 'center',
  },
  trendLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  energyProgressBg: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  energyProgress: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  riskCard: {
    marginBottom: 16,
    padding: 16,
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  riskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scoreCircleContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 32,
    fontWeight: '800',
  },
  scoreLabel: {
    fontSize: 12,
  },
  warningsContainer: {
    marginTop: 8,
  },
  warningsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  patternsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  patternCard: {
    width: '47%',
    padding: 16,
    alignItems: 'center',
  },
  patternIcon: {
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  patternValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  patternLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  recommendationsCard: {
    marginBottom: 16,
    padding: 16,
  },
  recommendationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  recIcon: {
    padding: 8,
    borderRadius: 10,
    marginRight: 12,
  },
  recContent: {
    flex: 1,
  },
  recMessage: {
    fontSize: 14,
    fontWeight: '500',
  },
  recAction: {
    fontSize: 12,
    marginTop: 2,
  },
  tipCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
  },
  tipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
});
