
import * as React from 'react';
import { View, ScrollView } from 'react-native';
import { Badge } from '../ui/badge';
import { Text } from '../ui/text';
import { ContentCard } from './ContentCard';
import { cn } from '../../lib/utils';
import type { ContentPipelineProps, ContentPipelineProps as InternalPipelineProps, PipelineColumnProps } from '@ordo-todo/ui-shared';

// Override shared props for now to avoid strict type issues if mismatch
interface MobilePipelineProps extends Omit<InternalPipelineProps, 'onStatusChange'> {
  onStatusChange?: (id: string, newStatus: string) => void;
}

export function ContentPipeline({
  pipeline,
  onContentClick,
  loading,
  className,
  testID,
}: MobilePipelineProps) {
  
  const columns: { id: string; title: string; data: any[]; color: string }[] = [
    { id: 'scripting', title: 'Scripting', data: pipeline.scripting, color: 'default' },
    { id: 'filming', title: 'Filming', data: pipeline.filming, color: 'warning' },
    { id: 'editing', title: 'Editing', data: pipeline.editing, color: 'secondary' },
    { id: 'scheduled', title: 'Scheduled', data: pipeline.scheduled, color: 'primary' },
    { id: 'published', title: 'Published', data: pipeline.published, color: 'success' },
  ];

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      className={cn("flex-1", className)}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}
      testID={testID}
    >
      {columns.map((column) => (
        <View key={column.id} className="w-80 h-full">
          <View className="flex-row items-center justify-between mb-4">
             <Text variant="h6" className="font-semibold text-gray-200">
               {column.title}
             </Text>
             <Badge variant="default" size="sm" pill>
               {column.data.length}
             </Badge>
          </View>
          
          <ScrollView 
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
          >
            {column.data.map((item) => (
              <ContentCard 
                key={item.id} 
                content={item}
                onPress={() => onContentClick?.(item.id)}
              />
            ))}
            {column.data.length === 0 && (
               <View className="p-4 border-2 border-dashed border-gray-800 rounded-lg items-center justify-center">
                 <Text variant="body" color="muted">No content</Text>
               </View>
            )}
          </ScrollView>
        </View>
      ))}
    </ScrollView>
  );
}
