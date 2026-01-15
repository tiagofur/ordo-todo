
import React from 'react';
import { View, ScrollView, SafeAreaView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { ConsistencyScore, Card, Text } from '@ordo-todo/ui-mobile';
import { Lightbulb, Layers, Calendar, Video, StickyNote } from 'lucide-react-native';

function QuickAction({ title, icon: Icon, color, bgClass, route }: any) {
  return (
    <Pressable className="flex-1" onPress={() => router.push(route)}>
      <Card className="items-center p-4 bg-gray-900 border-gray-800" clickable>
        <View className={`w-12 h-12 rounded-full items-center justify-center mb-2 ${bgClass}`}>
          <Icon size={24} color={color} />
        </View>
        <Text variant="label" className="text-gray-200">{title}</Text>
      </Card>
    </Pressable>
  );
}

export default function CreatorDashboard() {
  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      <ScrollView className="flex-1 p-4" contentContainerStyle={{ gap: 24, paddingBottom: 100 }}>
        
        <View className="mb-4">
          <Text variant="h3" className="text-white mb-2">Creator OS</Text>
          <Text variant="body" color="muted">Manage your content empire.</Text>
        </View>

        <ConsistencyScore 
            score={85}
            currentStreak={12}
            longestStreak={15}
            publishedThisWeek={4}
            targetThisWeek={5}
        />

        <View className="flex-row gap-3">
           <QuickAction 
             title="Ideas" 
             icon={Lightbulb} 
             color="#FACC15" 
             bgClass="bg-yellow-500/10"
             route="/screens/(internal)/creator/ideas" 
           />
           <QuickAction 
             title="Pipeline" 
             icon={Video} 
             color="#A855F7" 
             bgClass="bg-purple-500/10"
             route="/screens/(internal)/creator/pipeline" 
           />
        </View>

        <View className="flex-row gap-3">
           <QuickAction 
             title="Series" 
             icon={Layers} 
             color="#EC4899" 
             bgClass="bg-pink-500/10"
             route="/screens/(internal)/creator/series" 
           />
           <QuickAction 
             title="Publishing" 
             icon={Calendar} 
             color="#3B82F6" 
             bgClass="bg-blue-500/10"
             route="/screens/(internal)/creator/publishing" 
           />
        </View>

        <View className="flex-row gap-3">
           <QuickAction 
             title="Notes" 
             icon={StickyNote} 
             color="#EAB308" 
             bgClass="bg-yellow-500/10"
             route="/screens/(internal)/notes" 
           />
           <View className="flex-1" />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
