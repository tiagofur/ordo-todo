
import * as React from 'react';
import { View } from 'react-native';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Text } from '../ui/text';
import { Button } from '../ui/button';
import { Flame, Trophy, Calendar, RefreshCw } from 'lucide-react-native';
import { cn } from '../../lib/utils';
import type { 
  ConsistencyScoreProps, 
  GoalProgressProps, 
  StreakBadgeProps 
} from '@ordo-todo/ui-shared';

export function ConsistencyStreakBadge({ streak, size = 'md', animated = false }: StreakBadgeProps) {
  return (
    <View className="flex-row items-center bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-500/20">
       <Flame size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} color="#F97316" className={animated ? 'opacity-100' : ''} />
       <Text className={cn(
          "ml-1 font-bold text-orange-400",
          size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-sm'
       )}>
         {streak} week streak
       </Text>
    </View>
  );
}

export function GoalProgress({ current, target, label, period, showPercentage }: GoalProgressProps) {
  const percentage = Math.round((current / target) * 100);
  const clampedPercentage = Math.min(100, Math.max(0, percentage));
  
  return (
    <View className="mb-4">
       {label && (
          <View className="flex-row justify-between mb-2">
             <Text variant="label" className="text-gray-300">{label}</Text>
             {showPercentage && <Text variant="caption" color="muted">{percentage}%</Text>}
          </View>
       )}
       
       <View className="h-2 bg-gray-800 rounded-full overflow-hidden w-full">
          <View 
            className="h-full bg-cyan-500 rounded-full" 
            style={{ width: `${clampedPercentage}%` }} 
          />
       </View>
       
       <View className="flex-row justify-between mt-1">
          <Text variant="caption" color="muted">
            {current} / {target} {period === 'weekly' ? 'this week' : 'posts'}
          </Text>
          {percentage >= 100 && (
             <Text variant="caption" className="text-green-400 font-medium">Goal Met!</Text>
          )}
       </View>
    </View>
  );
}

export function ConsistencyScore({
  score,
  currentStreak,
  longestStreak,
  publishedThisWeek,
  targetThisWeek,
  compact = false,
  className,
}: ConsistencyScoreProps) {
  return (
    <Card className={cn("bg-gray-900 border-gray-800", className)} padding="lg">
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-row items-center gap-2">
          <Trophy size={20} color="#FACC15" />
          <Text variant="h5" className="font-bold text-gray-100">Consistency Score</Text>
        </View>
        <ConsistencyStreakBadge streak={currentStreak} animated={currentStreak > 0} />
      </View>

      <View className="flex-row items-end justify-center mb-8">
        <Text className="text-6xl font-black text-white">{score}</Text>
        <Text className="text-xl text-gray-500 mb-2 ml-1">/100</Text>
      </View>

      {!compact && (
        <View className="space-y-6">
           <GoalProgress 
              current={publishedThisWeek} 
              target={targetThisWeek} 
              label="Weekly Goal" 
              period="weekly"
              showPercentage
           />
           
           <View className="flex-row gap-3 pt-4 border-t border-gray-800">
               <View className="flex-1 bg-gray-800/50 p-3 rounded-lg">
                  <Text variant="caption" color="muted" className="mb-1">Longest Streak</Text>
                  <View className="flex-row items-center gap-2">
                     <Flame size={16} color="#6B7280" />
                     <Text variant="h6" className="font-bold text-gray-200">{longestStreak}w</Text>
                  </View>
               </View>
               
               <View className="flex-1 bg-gray-800/50 p-3 rounded-lg">
                  <Text variant="caption" color="muted" className="mb-1">Total Posts</Text>
                  <View className="flex-row items-center gap-2">
                     <Calendar size={16} color="#6B7280" />
                     <Text variant="h6" className="font-bold text-gray-200">{publishedThisWeek}</Text> 
                  </View>
               </View>
           </View>
        </View>
      )}
    </Card>
  );
}
