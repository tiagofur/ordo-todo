import React from 'react';
import { View, FlatList, SafeAreaView, useWindowDimensions } from 'react-native';
import { Stack } from 'expo-router';
import { SeriesCard, Button, Text } from '@ordo-todo/ui-mobile';
import { Plus } from 'lucide-react-native';
import { useSeries } from '@/app/lib/shared-hooks';

export default function SeriesScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const numColumns = isTablet ? 2 : 1;

  const { data: series, isLoading } = useSeries();
  const safeSeries = series || [];

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      <Stack.Screen 
        options={{ 
          title: 'Series',
          headerRight: () => (
             <Button variant="primary" size="sm" onPress={() => console.log('New Series')}>
               <Plus size={20} color="white" />
             </Button>
          ),
          headerStyle: { backgroundColor: '#111827' },
          headerTintColor: '#fff',
        }} 
      />
      
      <View className="p-4 flex-1">
        <FlatList
          key={numColumns}
          data={safeSeries}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          columnWrapperStyle={isTablet ? { gap: 16 } : undefined}
          contentContainerStyle={{ gap: 16 }}
          renderItem={({ item }) => (
            <View className={isTablet ? "flex-1" : "mb-4"}>
               <SeriesCard 
                 series={item} 
                 onPress={() => console.log('View Series', item.id)}
               />
            </View>
          )}
          ListEmptyComponent={
            !isLoading ? (
              <View className="items-center py-10">
                <Text color="muted">No series found.</Text>
              </View>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
}
