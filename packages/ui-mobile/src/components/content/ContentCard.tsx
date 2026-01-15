
import * as React from 'react';
import { View, Image } from 'react-native';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Text } from '../ui/text';
import { Button } from '../ui/button';
import { 
  FileText, 
  Video, 
  Image as ImageIcon,
  MoreVertical,
  Calendar,
  Layers
} from 'lucide-react-native';
import { cn } from '../../lib/utils';
import type { ContentCardProps } from '@ordo-todo/ui-shared';

const typeIcons: Record<string, any> = {
  VIDEO: Video,
  SHORTS: Video,
  IMAGE: ImageIcon,
  POST: FileText,
  THREAD: FileText,
  BLOG: FileText,
};

const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'> = {
  SCRIPTING: 'default',
  FILMING: 'warning',
  EDITING: 'secondary',
  SCHEDULED: 'primary',
  PUBLISHED: 'success',
  ARCHIVED: 'default',
};

export function ContentCard({
  content,
  onClick,
  onPress,
  compact = false,
  className,
  testID,
}: ContentCardProps) {
  const handleClick = onPress ?? onClick;
  const TypeIcon = typeIcons[content.contentType] || FileText;
  const statusColor = statusColors[content.status] || 'default';
  
  const formattedDate = content.scheduledAt 
    ? new Date(content.scheduledAt).toLocaleDateString() 
    : content.publishedAt 
      ? new Date(content.publishedAt).toLocaleDateString()
      : null;

  return (
    <Card
      testID={testID}
      className={cn(
        'overflow-hidden',
        compact ? 'p-0' : 'p-0',
        className
      )}
      onPress={handleClick}
      clickable
    >
      <View className="flex-row">
        {content.thumbnailUrl ? (
          <Image 
            source={{ uri: content.thumbnailUrl }} 
            className="w-24 h-full bg-gray-800"
            resizeMode="cover"
          />
        ) : (
          <View className="w-24 h-full bg-gray-800 items-center justify-center">
            <TypeIcon size={24} color="#6B7280" />
          </View>
        )}

        <View className="flex-1 p-3">
          <View className="flex-row items-center justify-between mb-1">
            <Badge variant={statusColor} size="sm">
              {content.status.toLowerCase()}
            </Badge>
            {content.series && (
              <View className="flex-row items-center">
                <Layers size={12} color={content.series.color} />
                <Text variant="caption" className="ml-1 text-gray-400">
                  {content.series.name.substring(0, 10)}...
                </Text>
              </View>
            )}
          </View>

          <Text variant="h6" numberOfLines={2} className="mb-1 text-gray-100">
            {content.title}
          </Text>

          {formattedDate && (
             <View className="flex-row items-center mt-auto">
               <Calendar size={12} color="#9CA3AF" />
               <Text variant="caption" className="ml-1 text-gray-400">
                 {formattedDate}
               </Text>
             </View>
          )}
        </View>
      </View>
    </Card>
  );
}
