import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useObjectives } from '@/app/lib/shared-hooks';
import { SafeAreaView } from 'react-native-safe-area-context';
import Loading from '../../../components/shared/loading.component';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function GoalsScreen() {
  const router = useRouter();
  const { data: objectives, isLoading } = useObjectives();

  if (isLoading) return <Loading />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
            <View style={styles.titleContainer}>
                <View style={[styles.iconBox, { backgroundColor: '#fdf2f8' }]}>
                    <MaterialCommunityIcons name="target" size={24} color="#db2777" />
                </View>
                <Text style={styles.title}>Goals (OKRs)</Text>
            </View>
        </View>
        
        <FlatList 
            contentContainerStyle={styles.listContent}
            data={objectives}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
                <Pressable 
                    onPress={() => router.push(`/(internal)/goals/${item.id}`)}
                    style={styles.card}
                >
                    <View style={styles.cardHeader}>
                         <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                         <View style={[styles.statusBadge, { backgroundColor: '#f3f4f6' }]}>
                             <Text style={{ fontSize: 10, color: '#666' }}>{item.period}</Text>
                         </View>
                    </View>

                    <View style={styles.progressContainer}>
                        <View style={styles.progressHeader}>
                            <Text style={styles.progressLabel}>Average Progress</Text>
                            <Text style={styles.progressValue}>{Math.round(item.progress)}%</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View 
                                style={[
                                    styles.progressBarFill, 
                                    { width: `${item.progress}%`, backgroundColor: item.color || '#ec4899' }
                                ]} 
                            />
                        </View>
                    </View>
                    <View style={styles.cardFooter}>
                         <Text style={styles.krCount}>{item.keyResults?.length || 0} Key Results</Text>
                    </View>
                </Pressable>
            )}
            ListEmptyComponent={
                <View style={styles.emptyState}>
                    <MaterialCommunityIcons name="target-variant" size={48} color="#ccc" />
                    <Text style={styles.emptyText}>No objectives found.</Text>
                </View>
            }
        />
        <Pressable
            style={styles.fab}
            onPress={() => router.push('/(internal)/goals/create')}
        >
            <MaterialCommunityIcons name="plus" size={24} color="white" />
        </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111',
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 16,
        paddingBottom: 80,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    cardHeader: {
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#333',
        flex: 1,
        marginRight: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    progressContainer: {
        marginTop: 4,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    progressLabel: {
        fontSize: 12,
        color: '#6b7280',
    },
    progressValue: {
        fontSize: 12,
        fontWeight: '700',
        color: '#111',
    },
    progressBarBg: {
        height: 6,
        backgroundColor: '#f3f4f6',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    cardFooter: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f9fafb',
    },
    krCount: {
        fontSize: 11,
        color: '#9ca3af',
        fontWeight: '500',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 16,
        color: '#9ca3af',
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#db2777',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#db2777',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    }
});
