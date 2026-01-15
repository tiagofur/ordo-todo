import React from 'react';
import { View, SafeAreaView, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { ContentPipeline, Text } from '@ordo-todo/ui-mobile';
import { useContentPipeline } from '@/app/lib/shared-hooks';

export default function PipelineScreen() {
  const { data: pipeline, isLoading } = useContentPipeline();

  // Ensure default structure if data is missing
  const safePipeline = pipeline || {
    scripting: [],
    filming: [],
    editing: [],
    scheduled: [],
    published: [],
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      <Stack.Screen 
        options={{ 
          title: 'Pipeline',
          headerStyle: { backgroundColor: '#111827' },
          headerTintColor: '#fff',
        }} 
      />
      
      <View className="flex-1 pt-4">
         {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#A855F7" />
            </View>
         ) : (
            <ContentPipeline 
              pipeline={safePipeline}
              onContentClick={(id) => console.log('Content clicked', id)}
            />
         )}
      </View>
    </SafeAreaView>
  );
}
