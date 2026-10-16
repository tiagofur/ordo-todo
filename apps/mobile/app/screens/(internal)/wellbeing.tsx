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
  Dimensions,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '@/app/data/hooks/use-theme-colors.hook';
import Card from '@/app/components/shared/card.component';
import { apiClient } from '@/app/lib/api-client';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

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
  const accentColor = '#f43f5e'; // Rose

  const fetchData = async () => {
    try {
      const [burnoutRes, patternsRes, weeklyRes, recsRes] = await Promise.allSettled([
        apiClient.getBurnoutAnalysis(),
        apiClient.getWorkPatterns(),
        apiClient.getWeeklyWellbeingSummary(),
        apiClient.getRestRecommendations(),
      ]);

      if (burnoutRes.status === 'fulfilled') setBurnout((burnoutRes as any).value);
      if (patternsRes.status === 'fulfilled') setPatterns((patternsRes as any).value);
      if (weeklyRes.status === 'fulfilled') setWeekly((weeklyRes as any).value);
      if (recsRes.status === 'fulfilled') setRecommendations(Array.isArray((recsRes as any).value) ? (recsRes as any).value : []);
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
        <ActivityIndicator size="large" color={accentColor} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Analizando tu bienestar...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Standard Iconic Header */}
      <View style={[styles.headerMainContainer, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {/* Decorative Background Elements */}
        <Animated.View entering={FadeIn.delay(200).duration(1000)} style={[styles.headerDecorationCircle1, { backgroundColor: accentColor }]} />
        <Animated.View entering={FadeIn.delay(400).duration(1000)} style={[styles.headerDecorationCircle2, { backgroundColor: accentColor }]} />

        <View style={styles.headerContainer}>
            {/* Icon Box */}
            <Animated.View entering={FadeInDown.delay(200).springify()} style={[styles.iconBox, { backgroundColor: accentColor, shadowColor: accentColor }]}>
                <Ionicons name="heart" size={28} color="#FFFFFF" />
            </Animated.View>

            {/* Title & Subtitle */}
            <View style={styles.headerTextContainer}>
                <Animated.Text entering={FadeInDown.delay(300).springify()} style={[styles.headerTitle, { color: colors.text }]}>
                    Bienestar
                </Animated.Text>
                <Animated.Text entering={FadeInDown.delay(400).springify()} style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                    Tu equilibrio personal
                </Animated.Text>
            </View>

            {/* Action Button (Optional, Refresh) */}
             <Pressable 
                onPress={onRefresh}
                style={({ pressed }) => [
                    styles.headerActionButton,
                    pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] },
                    { backgroundColor: colors.background }
                ]}
            >
                <Ionicons name="refresh" size={20} color={colors.textSecondary} />
            </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={accentColor} />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Energy Level - Mobile Feature */}
        {weekly && (
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <Pressable onPress={handleEnergyPress}>
              <Animated.View style={[styles.energyCard, animatedEnergyStyle, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}>
                <View style={styles.energyContent}>
                  <View style={[styles.energyIconContainer, { backgroundColor: accentColor }]}>
                    <Feather name="battery-charging" size={24} color="#fff" />
                  </View>
                  <View style={styles.energyTextContainer}>
                    <Text style={[styles.energyLabel, { color: colors.textSecondary }]}>Nivel de Energía</Text>
                    <View style={styles.energyScoreRow}>
                      <Text style={[styles.energyScore, { color: colors.text }]}>{weekly.overallScore}</Text>
                      <Text style={[styles.energyMax, { color: colors.textMuted }]}>/100</Text>
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
                <View style={[styles.energyProgressBg, { backgroundColor: colors.border }]}>
                  <View style={[styles.energyProgress, { width: `${weekly.overallScore}%`, backgroundColor: accentColor }]} />
                </View>
              </Animated.View>
            </Pressable>
          </Animated.View>
        )}

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
                  <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>PUNTOS</Text>
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
                        style={{ marginTop: 2 }}
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
                <Feather name="zap" size={20} color={accentColor} />
                <Text style={[styles.cardTitle, { color: colors.text }]}>Recomendaciones</Text>
              </View>
              {recommendations.slice(0, 4).map((rec, idx) => (
                <Pressable 
                  key={idx} 
                  style={[
                      styles.recommendationItem, 
                      { borderBottomColor: colors.border },
                      idx === recommendations.length - 1 && { borderBottomWidth: 0 }
                  ]}
                  onPress={() => {
                    if (Platform.OS === 'ios') {
                      Haptics.selectionAsync();
                    }
                  }}
                >
                  <View style={[styles.recIcon, { backgroundColor: accentColor + '20' }]}>
                    <Feather name="star" size={16} color={accentColor} />
                  </View>
                  <View style={styles.recContent}>
                    <Text style={[styles.recMessage, { color: colors.text }]}>{rec.message}</Text>
                    {rec.suggestedAction && (
                      <Text style={[styles.recAction, { color: colors.textSecondary }]}>
                        {rec.suggestedAction}
                      </Text>
                    )}
                  </View>
                </Pressable>
              ))}
            </Card>
          </Animated.View>
        )}

        {/* Weekly Summary Quick Tips */}
        {weekly && weekly.recommendations && weekly.recommendations.length > 0 && (
          <Animated.View entering={FadeInDown.delay(600).springify()}>
            <Card style={[styles.tipCard, { backgroundColor: accentColor + '10', borderColor: accentColor + '30', borderWidth: 1 }]}>
              <View style={styles.tipContent}>
                <Feather name="info" size={24} color={accentColor} />
                <Text style={[styles.tipText, { color: colors.text }]}>
                  {weekly.recommendations[0]}
                </Text>
              </View>
            </Card>
          </Animated.View>
        )}
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
  // Premium Header Styles
  headerMainContainer: {
    paddingTop: Platform.OS === 'android' ? 50 : 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  headerDecorationCircle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.05,
  },
  headerDecorationCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    opacity: 0.05,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    zIndex: 1,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 2,
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  // Content Styles
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  energyCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  energyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  energyIconContainer: {
    padding: 10,
    borderRadius: 14,
  },
  energyTextContainer: {
    flex: 1,
    marginLeft: 14,
  },
  energyLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  energyScoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  energyScore: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
  },
  energyMax: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 2,
  },
  trendContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  trendLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  energyProgressBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  energyProgress: {
    height: '100%',
    borderRadius: 4,
  },
  riskCard: {
    marginBottom: 16,
    padding: 20,
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  riskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  riskBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  scoreCircleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -1,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  warningsContainer: {
    marginTop: 8,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 16,
    padding: 16,
  },
  warningsTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  patternsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  patternCard: {
    width: (width - 52) / 2, // 2 columns with spacing
    padding: 16,
    alignItems: 'flex-start',
  },
  patternIcon: {
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  patternValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  patternLabel: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
    fontWeight: '500',
  },
  recommendationsCard: {
    marginBottom: 20,
    padding: 0,
    overflow: 'hidden',
  },
  recommendationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  recIcon: {
    padding: 10,
    borderRadius: 12,
    marginRight: 14,
  },
  recContent: {
    flex: 1,
  },
  recMessage: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  recAction: {
    fontSize: 13,
  },
  tipCard: {
    marginBottom: 30,
    padding: 16,
    borderRadius: 16,
  },
  tipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
});
