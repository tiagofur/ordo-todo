import React from 'react';
import { View, FlatList, SafeAreaView, useWindowDimensions } from 'react-native';
import { Stack } from 'expo-router';
import { SocialPostCard, Text } from '@ordo-todo/ui-mobile';
import { useScheduledPosts } from '@/app/lib/shared-hooks';

export default function PublishingScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const numColumns = isTablet ? 2 : 1;

  const { data: postsData, isLoading } = useScheduledPosts({ limit: 50 });
  const posts = (postsData?.data || []).map(post => ({
    ...post,
    scheduledAt: post.scheduledAt ? new Date(post.scheduledAt) : undefined,
    publishedAt: post.publishedAt ? new Date(post.publishedAt) : undefined,
  }));

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      <Stack.Screen 
        options={{ 
          title: 'Publishing',
          headerStyle: { backgroundColor: '#111827' },
          headerTintColor: '#fff',
        }} 
      />
      
      <View className="p-4 flex-1">
        <FlatList
          key={numColumns}
          data={posts}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
           columnWrapperStyle={isTablet ? { gap: 16 } : undefined}
          contentContainerStyle={{ gap: 16 }}
          renderItem={({ item }) => (
            <View className={isTablet ? "flex-1" : "mb-4"}>
               <SocialPostCard 
                 post={item} 
                 onPress={() => console.log('View Post', item.id)}
               />
            </View>
          )}
          ListEmptyComponent={
            !isLoading ? (
              <View className="items-center py-10">
                <Text color="muted">No scheduled posts.</Text>
              </View>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
}
