
import * as React from 'react';
import { View, Linking } from 'react-native';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Text } from '../ui/text';
import { Button } from '../ui/button';
import { 
  Youtube,
  Instagram,
  Linkedin,
  Twitter,
  FileText,
  Clock,
  ExternalLink,
  MoreVertical,
  AlertCircle,
  Eye,
  Heart,
  MessageCircle,
  Share2 
} from 'lucide-react-native';
import { cn } from '../../lib/utils';
import type { SocialPostCardProps } from '@ordo-todo/ui-shared';

const platformConfig: Record<string, { label: string; color: string; icon: any }> = {
  YOUTUBE: { label: 'YouTube', color: '#FF0000', icon: Youtube },
  INSTAGRAM: { label: 'Instagram', color: '#E1306C', icon: Instagram },
  LINKEDIN: { label: 'LinkedIn', color: '#0077B5', icon: Linkedin },
  TWITTER: { label: 'Twitter', color: '#1DA1F2', icon: Twitter },
  TIKTOK: { label: 'TikTok', color: '#000000', icon:  VideoIcon },
  BLOG: { label: 'Blog', color: '#333333', icon: FileText },
};

// Fallback icon helper
function VideoIcon(props: any) { 
    return <FileText {...props} />; 
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  DRAFT: { label: 'Draft', color: 'bg-gray-500/10 text-gray-500', icon: FileText },
  SCHEDULED: { label: 'Scheduled', color: 'bg-blue-500/10 text-blue-500', icon: Clock },
  PUBLISHING: { label: 'Publishing', color: 'bg-yellow-500/10 text-yellow-500', icon:  VideoIcon }, // Spinner ideally
  PUBLISHED: { label: 'Published', color: 'bg-green-500/10 text-green-500', icon:  ExternalLink },
  FAILED: { label: 'Failed', color: 'bg-red-500/10 text-red-500', icon: AlertCircle },
};

const defaultPlatform = platformConfig.BLOG;
const defaultStatus = statusConfig.DRAFT;

export function SocialPostCard({
  post,
  onClick,
  onPress,
  onEdit,
  onReschedule,
  className,
  testID,
}: SocialPostCardProps) {
  const handleClick = onPress ?? onClick;
  
  const platform = platformConfig[post.platform] ?? defaultPlatform!;
  const status = statusConfig[post.status] ?? defaultStatus!;
  
  const PlatformIcon = platform.icon;
  const StatusIcon = status.icon;

  const handleOpenUrl = () => {
    if (post.platformUrl) {
      Linking.openURL(post.platformUrl);
    }
  };

  return (
    <Card
      testID={testID}
      className={cn(className)}
      onPress={handleClick}
      clickable
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-row items-center gap-2">
           <PlatformIcon size={18} color={platform.color} />
           <Text variant="label" className="text-gray-300">{platform.label}</Text>
        </View>
        <Badge 
          className={cn(
             // NativeWind might need simpler color classes than arbitrary bg/text
             status.label === 'Published' ? 'bg-green-500/20' : 
             status.label === 'Failed' ? 'bg-red-500/20' : 
             status.label === 'Scheduled' ? 'bg-blue-500/20' : 'bg-gray-700'
          )} 
          variant="default" // Using default but overriding with className for custom colors
          size="sm"
        >
          {status.label}
        </Badge>
      </View>

      <Text variant="h6" numberOfLines={2} className="mb-2 text-gray-100">
        {post.title || 'Untitled Post'}
      </Text>

      {post.errorMessage && (
        <View className="flex-row items-center gap-2 p-2 mb-3 bg-red-500/10 rounded-lg border border-red-500/20">
           <AlertCircle size={14} color="#EF4444" />
           <Text variant="caption" className="text-red-400 flex-1">
             {post.errorMessage}
           </Text>
        </View>
      )}

      {post.scheduledAt && post.status === 'SCHEDULED' && (
         <View className="flex-row items-center mb-3">
            <Clock size={14} color="#9CA3AF" />
            <Text variant="caption" color="muted" className="ml-1">
               Scheduled for {new Date(post.scheduledAt).toLocaleString()}
            </Text>
         </View>
      )}

      {/* Analytics Row */}
      {post.status === 'PUBLISHED' && (
         <View className="flex-row items-center justify-between border-t border-gray-800 pt-3 mt-1">
            <View className="flex-row items-center gap-1">
               <Eye size={14} color="#9CA3AF" />
               <Text variant="caption" color="muted">{post.views || 0}</Text>
            </View>
            <View className="flex-row items-center gap-1">
               <Heart size={14} color="#9CA3AF" />
               <Text variant="caption" color="muted">{post.likes || 0}</Text>
            </View>
            <View className="flex-row items-center gap-1">
               <MessageCircle size={14} color="#9CA3AF" />
               <Text variant="caption" color="muted">{post.comments || 0}</Text>
            </View>
            <View className="flex-row items-center gap-1">
               <Share2 size={14} color="#9CA3AF" />
               <Text variant="caption" color="muted">{post.shares || 0}</Text>
            </View>
         </View>
      )}

      {/* Actions */}
      <View className="flex-row justify-end gap-2 mt-3 pt-2 border-t border-gray-800">
          {post.platformUrl && (
             <Button variant="ghost" size="sm" onPress={handleOpenUrl}>
                <ExternalLink size={16} color="#9CA3AF" />
             </Button>
          )}
          <Button variant="ghost" size="sm" onPress={onEdit}>
             <MoreVertical size={16} color="#9CA3AF" />
          </Button>
      </View>
    </Card>
  );
}
