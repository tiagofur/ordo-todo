
import * as React from 'react';
import { View } from 'react-native';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Text } from '../ui/text';
import { Button } from '../ui/button';
import { 
  Lightbulb, 
  Mic, 
  MessageSquare, 
  Mail, 
  Globe, 
  Upload, 
  MoreVertical
} from 'lucide-react-native';
import { cn } from '../../lib/utils';
import type { IdeaCardProps } from '@ordo-todo/ui-shared';

const sourceIcons: Record<string, typeof Lightbulb> = {
  MANUAL: Lightbulb,
  VOICE: Mic,
  WHATSAPP: MessageSquare,
  TELEGRAM: MessageSquare,
  EMAIL: Mail,
  BROWSER: Globe,
  IMPORT: Upload,
};

export function IdeaCard({
  idea,
  onClick,
  onPress,
  onPromote,
  onArchive,
  onEdit,
  selected = false,
  compact = false,
  className,
  testID,
}: IdeaCardProps) {
  const handleClick = onPress ?? onClick;
  const SourceIcon = sourceIcons[idea.source] || Lightbulb;
  const iconColor = "#9CA3AF"; // gray-400

  return (
    <Card
      testID={testID}
      className={cn(
        selected && 'border-cyan-500',
        compact ? 'p-3' : 'p-4',
        className
      )}
      onPress={handleClick}
      clickable
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2">
          <SourceIcon size={16} color={iconColor} />
          <Badge variant="secondary" size="sm">
            {idea.status.toLowerCase()}
          </Badge>
        </View>
        <Button variant="ghost" size="xs">
           <MoreVertical size={16} color={iconColor} />
        </Button>
      </View>

      <Text variant="h6" numberOfLines={2} className="mb-1 text-gray-100">
        {idea.title}
      </Text>

      {!compact && idea.description && (
        <Text variant="body" color="muted" numberOfLines={2} className="mb-3">
          {idea.description}
        </Text>
      )}

      {idea.tags && idea.tags.length > 0 && (
         <View className="flex-row flex-wrap gap-1 mt-2">
            {idea.tags.slice(0, compact ? 2 : 5).map(tag => (
               <Badge key={tag.id} variant="default" size="sm" className="bg-gray-800 mr-1 mb-1">
                  {tag.name}
               </Badge>
            ))}
         </View>
      )}
    </Card>
  );
}
