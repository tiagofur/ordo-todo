
import * as React from 'react';
import { View, Image } from 'react-native';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Text } from '../ui/text';
import { Button } from '../ui/button';
import { 
  Layers,
  MoreVertical,
  Play,
  Hash,
  Repeat
} from 'lucide-react-native';
import { cn } from '../../lib/utils';
import type { SeriesCardProps } from '@ordo-todo/ui-shared';

const typeIcons: Record<string, any> = {
  EPISODIC: Layers,
  THEMATIC: Hash,
  CHALLENGE: Play,
  EVERGREEN: Repeat,
};

const seriesTypeConfig: Record<string, { label: string; color: string }> = {
  EPISODIC: { label: 'Episodic', color: 'primary' },
  THEMATIC: { label: 'Thematic', color: 'secondary' },
  CHALLENGE: { label: 'Challenge', color: 'warning' },
  EVERGREEN: { label: 'Evergreen', color: 'success' },
};

export function SeriesCard({
  series,
  onClick,
  onPress,
  onEdit,
  compact = false,
  className,
  testID,
}: SeriesCardProps) {
  const handleClick = onPress ?? onClick;
  const TypeIcon = typeIcons[series.seriesType] || Layers;
  
  // Safe access with default fallback
  const typeConfig = seriesTypeConfig[series.seriesType] || seriesTypeConfig.EPISODIC!;
  // Type assertion for Badge variant
  const badgeVariant = (typeConfig.color as any) || 'default';

  return (
    <Card
      testID={testID}
      className={cn(
        'overflow-hidden',
        className
      )}
      padding="none"
      onPress={handleClick}
      clickable
    >
      <View className="h-24 w-full bg-gray-800 relative">
        {series.coverImage ? (
           <Image 
             source={{ uri: series.coverImage }} 
             className="w-full h-full opacity-60"
             resizeMode="cover"
           />
        ) : (
           <View className="w-full h-full items-center justify-center bg-gray-800/50">
             <Layers size={32} color={series.color || "#6B7280"} />
           </View>
        )}
        
        <View className="absolute top-2 right-2">
            <Badge variant={badgeVariant} size="sm">
               {typeConfig.label}
            </Badge>
        </View>

        <View className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-gray-900 to-transparent">
             <Text variant="h5" numberOfLines={1} className="text-white font-bold shadow-sm">
                {series.name}
             </Text>
        </View>
      </View>

      <View className="p-3">
        {!compact && series.description && (
          <Text variant="body" color="muted" numberOfLines={2} className="mb-3">
            {series.description}
          </Text>
        )}

        <View className="flex-row items-center justify-between mt-1">
           <View className="flex-row items-center gap-2">
              <View className="bg-gray-800 px-2 py-1 rounded flex-row items-center gap-1">
                 <Layers size={12} color="#9CA3AF" />
                 <Text variant="caption" color="muted">
                    {series.contentCount || 0} episodes
                 </Text>
              </View>
              {!series.isActive && (
                 <Badge variant="default" size="sm">Archived</Badge>
              )}
           </View>
           
           <Button variant="ghost" size="xs" onPress={onEdit}>
               <MoreVertical size={16} color="#9CA3AF" />
           </Button>
        </View>
      </View>
    </Card>
  );
}
