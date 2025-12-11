import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useObjective } from '../../../hooks/api';
import Loading from '../../../components/shared/loading.component';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GoalDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { data: objective, isLoading } = useObjective(id as string);

  if (isLoading) return <Loading />;
  if (!objective) return <View style={styles.center}><Text>Objective not found</Text></View>;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
        <Stack.Screen options={{ 
            title: 'Goal Details', 
            headerBackTitle: 'Goals', 
            headerTintColor: '#db2777',
            headerRight: () => (
                <Pressable onPress={() => router.push({ pathname: '/(internal)/goals/create', params: { id: id as string } })} style={{ marginRight: 16 }}>
                    <MaterialCommunityIcons name="pencil" size={24} color="#db2777" />
                </Pressable>
            )
        }} />
        
        <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={styles.title}>{objective.title}</Text>
                {objective.description ? (
                    <Text style={styles.description}>{objective.description}</Text>
                ) : null}
                
                <View style={styles.periodBadge}>
                    <MaterialCommunityIcons name="calendar" size={14} color="#666" />
                    <Text style={styles.periodText}>{objective.period}</Text>
                </View>
            </View>

            <View style={styles.card}>
                 <Text style={styles.sectionTitle}>Overall Progress</Text>
                 <View style={styles.progressBarBg}>
                     <View style={[styles.progressBarFill, { width: `${objective.progress}%`, backgroundColor: objective.color || '#ec4899' }]} />
                 </View>
                 <Text style={styles.progressText}>{Math.round(objective.progress)}% Complete</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionHeader}>Key Results ({objective.keyResults?.length || 0})</Text>
                {objective.keyResults?.map((kr) => {
                    const percentage = Math.min(100, Math.max(0, (kr.currentValue / kr.targetValue) * 100));
                    return (
                        <Pressable 
                            key={kr.id} 
                            style={styles.krCard}
                            onPress={() => router.push({ pathname: '/(internal)/goals/key-result', params: { objectiveId: id, id: kr.id } })}
                        >
                            <View style={styles.krHeader}>
                                <Text style={styles.krTitle}>{kr.title}</Text>
                                <Text style={styles.krValue}>{kr.currentValue} / {kr.targetValue} <Text style={{fontSize:10, color:'#888'}}>{kr.unit}</Text></Text>
                            </View>
                            <View style={styles.krProgressBg}>
                                <View style={[styles.krProgressFill, { width: `${percentage}%` }]} />
                            </View>
                        </Pressable>
                    );
                })}
                
                <Pressable 
                    style={styles.addKrButton}
                    onPress={() => router.push({ pathname: '/(internal)/goals/key-result', params: { objectiveId: id } })}
                >
                    <MaterialCommunityIcons name="plus" size={20} color="#db2777" />
                    <Text style={styles.addKrText}>Add Key Result</Text>
                </Pressable>
            </View>
        </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    center: {
        flex: 1, 
        justifyContent:'center', 
        alignItems:'center'
    },
    content: {
        padding: 20,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111',
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
        color: '#555',
        lineHeight: 24,
        marginBottom: 12,
    },
    periodBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e5e7eb',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        gap: 6,
    },
    periodText: {
        fontSize: 12,
        color: '#4b5563',
        fontWeight: '500',
    },
    card: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    progressBarBg: {
        height: 12,
        backgroundColor: '#f3f4f6',
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 6,
    },
    progressText: {
        textAlign: 'right',
        fontSize: 14,
        fontWeight: '700',
        color: '#111',
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#111',
    },
    krCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    krHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    krTitle: {
        fontSize: 15,
        fontWeight: '500',
        color: '#374151',
        flex: 1,
        marginRight: 10,
    },
    krValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111',
    },
    krProgressBg: {
        height: 6,
        backgroundColor: '#f3f4f6',
        borderRadius: 3,
        overflow: 'hidden',
    },
    krProgressFill: {
        height: '100%',
        backgroundColor: '#3b82f6',
        borderRadius: 3,
    },
    addKrButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        borderWidth: 1,
        borderColor: '#db2777',
        borderRadius: 12,
        borderStyle: 'dashed',
        marginTop: 8,
        gap: 8,
    },
    addKrText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#db2777',
    }
});
