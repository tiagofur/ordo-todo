import React from 'react';
import { View, FlatList, SafeAreaView, useWindowDimensions } from 'react-native';
import { Stack, router } from 'expo-router';
import { IdeaCard, Button, Text } from '@ordo-todo/ui-mobile';
import { Plus } from 'lucide-react-native';
import { useIdeas } from '@/app/lib/shared-hooks';

export default function IdeasScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const numColumns = isTablet ? 2 : 1;

  const { data: ideasData, isLoading } = useIdeas({ status: 'ACTIVE' });
  const ideas = ideasData?.data || [];

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      <Stack.Screen 
        options={{ 
          title: 'Ideas',
          headerRight: () => (
             <Button variant="primary" size="sm" onPress={() => console.log('New Idea')}>
               <Plus size={20} color="white" />
             </Button>
          ),
          headerStyle: { backgroundColor: '#111827' },
          headerTintColor: '#fff',
        }} 
      />
      
      <View className="p-4 flex-1">
        <FlatList
          key={numColumns} // Force re-render when columns change
          data={ideas}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          columnWrapperStyle={isTablet ? { gap: 16 } : undefined}
          contentContainerStyle={{ gap: 16 }}
          renderItem={({ item }) => (
            <View className={isTablet ? "flex-1" : "mb-4"}>
               <IdeaCard 
                 idea={item} 
                 onPress={() => console.log('View Idea', item.id)}
               />
            </View>
          )}
          ListHeaderComponent={
            <Text variant="body" color="muted" className="mb-4">
              Capture and organize your content ideas.
            </Text>
          }
          ListEmptyComponent={
            !isLoading ? (
              <View className="items-center py-10">
                <Text color="muted">No ideas found. Create your first one!</Text>
              </View>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
}
