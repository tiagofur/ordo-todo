import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useObjective } from '@/app/lib/shared-hooks';
import Loading from '@/app/components/shared/loading.component';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight, LinearTransition } from 'react-native-reanimated';
import { useDesignTokens } from '@/app/lib/use-design-tokens';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export default function GoalDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useDesignTokens();
  const { data: objective, isLoading } = useObjective(id as string);

  if (isLoading) return <Loading />;
  
  if (!objective) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Ionicons name="notifications-outline" size={64} color={colors.mutedForeground} opacity={0.3} />
        <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: 'bold', marginTop: 16 }}>
          {t('Goals.notFound', 'Objetivo no encontrado')}
        </Text>
        <Pressable 
          onPress={() => router.back()}
          style={{ marginTop: 24, padding: 12, backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.border }}
        >
          <Text style={{ color: colors.primary }}>{t('Common.back', 'Volver')}</Text>
        </Pressable>
      </View>
    );
  }

  const recordColor = objective.color || colors.section.goals;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
        <Stack.Screen options={{ 
            headerShown: false
        }} />
        
        <ScrollView 
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            {/* Standard Iconic Header */}
            <Animated.View 
                entering={FadeInDown.duration(600)}
                style={[styles.iconicHeader, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
                <View style={styles.headerTop}>
                    <Pressable 
                        onPress={() => router.back()}
                        style={[styles.backButton, { backgroundColor: colors.background }]}
                    >
                        <Ionicons name="arrow-back" size={20} color={colors.foreground} />
                    </Pressable>
                    
                    <View style={styles.actionButtons}>
                        <Pressable 
                            onPress={() => router.push({ pathname: '/(internal)/goals/create', params: { id: id as string } })}
                            style={[styles.actionButton, { backgroundColor: colors.background }]}
                        >
                            <Ionicons name="pencil" size={18} color={recordColor} />
                        </Pressable>
                    </View>
                </View>

                <View style={styles.headerMain}>
                    <View style={[styles.headerIcon, { backgroundColor: recordColor }]}>
                        <Ionicons name="flag" size={32} color="#FFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <View style={styles.statusRow}>
                            <View style={[styles.statusDot, { backgroundColor: objective.status === 'ACTIVE' ? '#22c55e' : colors.mutedForeground }]} />
                            <Text style={[styles.statusText, { color: colors.mutedForeground }]}>
                                {objective.status}
                            </Text>
                        </View>
                        <Text style={[styles.title, { color: colors.foreground }]}>{objective.title}</Text>
                    </View>
                </View>

                {objective.description ? (
                    <Text style={[styles.description, { color: colors.mutedForeground }]}>
                        {objective.description}
                    </Text>
                ) : null}

                <View style={styles.headerFooter}>
                    <View style={[styles.periodBadge, { backgroundColor: colors.background }]}>
                        <Ionicons name="calendar-outline" size={14} color={colors.mutedForeground} />
                        <Text style={[styles.periodText, { color: colors.mutedForeground }]}>{objective.period}</Text>
                    </View>
                    <View style={[styles.progressBadge, { backgroundColor: recordColor + '15' }]}>
                        <Text style={[styles.progressBadgeText, { color: recordColor }]}>
                            {Math.round(objective.progress)}% {t('Goals.progress', 'Progreso')}
                        </Text>
                    </View>
                </View>
            </Animated.View>

            {/* Overall Progress Card */}
            <Animated.View 
                entering={FadeInDown.delay(200).duration(600)}
                style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
                 <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Progreso Global</Text>
                 <View style={[styles.progressBarBg, { backgroundColor: colors.background }]}>
                     <Animated.View 
                        layout={LinearTransition}
                        style={[styles.progressBarFill, { width: `${objective.progress}%`, backgroundColor: recordColor }]} 
                     >
                        <View style={styles.progressGlow} />
                     </Animated.View>
                 </View>
                 <View style={styles.progressInfo}>
                    <Text style={[styles.progressStatus, { color: colors.foreground }]}>
                        {objective.period || 'Sin periodo'}
                    </Text>
                    <Text style={[styles.progressPercent, { color: recordColor }]}>{Math.round(objective.progress)}%</Text>
                 </View>
            </Animated.View>

            {/* Key Results Section */}
            <View style={styles.section}>
                <Animated.View 
                    entering={FadeInDown.delay(300)}
                    style={styles.sectionHeaderRow}
                >
                    <Text style={[styles.sectionHeader, { color: colors.foreground }]}>
                        Key Results <Text style={{ color: colors.mutedForeground, fontWeight: '400' }}>({objective.keyResults?.length || 0})</Text>
                    </Text>
                    <Pressable 
                        onPress={() => router.push({ pathname: '/(internal)/goals/key-result', params: { objectiveId: id } })}
                        style={[styles.addInlineButton, { backgroundColor: recordColor + '10' }]}
                    >
                        <Ionicons name="add" size={20} color={recordColor} />
                    </Pressable>
                </Animated.View>

                {objective.keyResults?.map((kr, index) => {
                    const percentage = Math.min(100, Math.max(0, (kr.currentValue / kr.targetValue) * 100));
                    return (
                        <Animated.View
                            key={kr.id}
                            entering={FadeInRight.delay(400 + index * 100)}
                        >
                            <Pressable 
                                style={[styles.krCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                                onPress={() => router.push({ pathname: '/(internal)/goals/key-result', params: { objectiveId: id, id: kr.id } })}
                            >
                                <View style={styles.krHeader}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.krTitle, { color: colors.foreground }]}>{kr.title}</Text>
                                        <Text style={[styles.krValue, { color: colors.mutedForeground }]}>
                                            <Text style={{ color: colors.foreground, fontWeight: '700' }}>{kr.currentValue}</Text> / {kr.targetValue} {kr.unit}
                                        </Text>
                                    </View>
                                    <View style={[styles.krBadge, { backgroundColor: (percentage >= 100 ? '#22c55e' : recordColor) + '15' }]}>
                                        <Text style={[styles.krBadgeText, { color: percentage >= 100 ? '#22c55e' : recordColor }]}>
                                            {Math.round(percentage)}%
                                        </Text>
                                    </View>
                                </View>
                                <View style={[styles.krProgressBg, { backgroundColor: colors.background }]}>
                                    <View style={[styles.krProgressFill, { width: `${percentage}%`, backgroundColor: percentage >= 100 ? '#22c55e' : recordColor }]} />
                                </View>
                            </Pressable>
                        </Animated.View>
                    );
                })}
                
                {(!objective.keyResults || objective.keyResults.length === 0) && (
                    <Animated.View 
                        entering={FadeInDown.delay(500)}
                        style={[styles.emptyKrs, { borderColor: colors.border, backgroundColor: colors.card }]}
                    >
                        <Ionicons name="stats-chart-outline" size={40} color={colors.mutedForeground} opacity={0.3} />
                        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                            No hay resultados clave definidos aún.
                        </Text>
                        <Pressable 
                            style={[styles.addKrButtonLarge, { backgroundColor: recordColor }]}
                            onPress={() => router.push({ pathname: '/(internal)/goals/key-result', params: { objectiveId: id } })}
                        >
                            <Ionicons name="add" size={20} color="#FFF" />
                            <Text style={styles.addKrTextLarge}>Agregar primer KR</Text>
                        </Pressable>
                    </Animated.View>
                )}
            </View>

            {/* Spacer for bottom */}
            <View style={{ height: 40 }} />
        </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        flex: 1, 
        justifyContent:'center', 
        alignItems:'center',
        padding: 20
    },
    content: {
        padding: 16,
    },
    iconicHeader: {
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerMain: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 16,
    },
    headerIcon: {
        width: 64,
        height: 64,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: '3deg' }],
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    title: {
        fontSize: 22,
        fontWeight: '900',
        lineHeight: 28,
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 20,
    },
    headerFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    periodBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
    },
    periodText: {
        fontSize: 12,
        fontWeight: '600',
    },
    progressBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    progressBadgeText: {
        fontSize: 12,
        fontWeight: '800',
    },
    card: {
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 16,
    },
    progressBarBg: {
        height: 12,
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 16,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 6,
    },
    progressGlow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '50%',
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    progressInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    progressStatus: {
        fontSize: 14,
        fontWeight: '700',
    },
    progressPercent: {
        fontSize: 20,
        fontWeight: '900',
    },
    section: {
        marginBottom: 24,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: '900',
    },
    addInlineButton: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    krCard: {
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
    },
    krHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    krTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
        paddingRight: 8,
    },
    krValue: {
        fontSize: 13,
    },
    krBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    krBadgeText: {
        fontSize: 12,
        fontWeight: '800',
    },
    krProgressBg: {
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    krProgressFill: {
        height: '100%',
        borderRadius: 3,
    },
    emptyKrs: {
        padding: 32,
        borderRadius: 24,
        borderWidth: 2,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 14,
        marginTop: 12,
        marginBottom: 20,
    },
    addKrButtonLarge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 16,
        gap: 8,
    },
    addKrTextLarge: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
    }
});
