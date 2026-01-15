'use client';

import * as React from 'react';
import { cn } from '../../../utils/index.js';
import { Badge } from '../../ui/badge.js';
import { Card } from '../../ui/card.js';
import { 
  Youtube, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Globe,
  Mic,
  Video,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  MoreVertical,
  Edit,
  Calendar,
  Trash
} from 'lucide-react';
import { Button } from '../../ui/button.js';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/dropdown-menu.js';
import type { SocialPostCardProps } from '@ordo-todo/ui-shared';

const platformConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  YOUTUBE: { icon: <Youtube className="size-4" />, color: '#FF0000' },
  TIKTOK: { icon: <Video className="size-4" />, color: '#00F2EA' },
  INSTAGRAM: { icon: <Instagram className="size-4" />, color: '#E4405F' },
  LINKEDIN: { icon: <Linkedin className="size-4" />, color: '#0A66C2' },
  TWITTER: { icon: <Twitter className="size-4" />, color: '#1DA1F2' },
  BLOG: { icon: <Globe className="size-4" />, color: '#6366F1' },
  PODCAST: { icon: <Mic className="size-4" />, color: '#9333EA' },
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  DRAFT: { label: 'Draft', color: 'text-gray-400', icon: null },
  SCHEDULED: { label: 'Scheduled', color: 'text-cyan-400', icon: <Clock className="size-3" /> },
  PUBLISHING: { label: 'Publishing...', color: 'text-yellow-400', icon: <Clock className="size-3 animate-spin" /> },
  PUBLISHED: { label: 'Published', color: 'text-green-400', icon: <CheckCircle2 className="size-3" /> },
  FAILED: { label: 'Failed', color: 'text-red-400', icon: <AlertCircle className="size-3" /> },
};

const defaultPlatform = platformConfig.BLOG;
const defaultStatus = statusConfig.DRAFT;

function getPlatformConfig(platform: string) {
  return platformConfig[platform] ?? defaultPlatform!;
}

function getStatusConfig(status: string) {
  return statusConfig[status] ?? defaultStatus!;
}

/**
 * SocialPostCard component for displaying scheduled/published social posts
 */
export function SocialPostCard({
  post,
  onClick,
  onPress,
  onEdit,
  onReschedule,
  className,
  testID,
}: SocialPostCardProps) {
  const handleClick = onClick ?? onPress;
  const platform = getPlatformConfig(post.platform);
  const status = getStatusConfig(post.status);

  return (
    <Card
      data-testid={testID}
      className={cn(
        'group relative transition-all p-4',
        'hover:border-gray-600 hover:shadow-lg hover:shadow-black/20',
        onClick || onPress ? 'cursor-pointer' : '',
        className
      )}
      onClick={handleClick}
    >
      {/* Header: Platform + Status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div 
            className="size-8 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: platform.color }}
          >
            {platform.icon}
          </div>
          <div className={cn('flex items-center gap-1 text-sm', status.color)}>
            {status.icon}
            {status.label}
          </div>
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onEdit && post.status !== 'PUBLISHED' && (
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="size-4 mr-2" />
                Edit
              </DropdownMenuItem>
            )}
            {onReschedule && post.status === 'SCHEDULED' && (
              <DropdownMenuItem onClick={onReschedule}>
                <Calendar className="size-4 mr-2" />
                Reschedule
              </DropdownMenuItem>
            )}
            {post.platformUrl && (
              <DropdownMenuItem asChild>
                <a href={post.platformUrl} target="_blank" rel="noopener noreferrer">
                  <Globe className="size-4 mr-2" />
                  View on {post.platform.toLowerCase()}
                </a>
              </DropdownMenuItem>
            )}
            {post.status !== 'PUBLISHED' && (
              <DropdownMenuItem className="text-red-400">
                <Trash className="size-4 mr-2" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Title */}
      {post.title && (
        <h3 className="font-medium text-gray-100 line-clamp-2 mb-2">
          {post.title}
        </h3>
      )}

      {/* Description */}
      {post.description && (
        <p className="text-sm text-gray-400 line-clamp-2 mb-3">
          {post.description}
        </p>
      )}

      {/* Error message */}
      {post.status === 'FAILED' && post.errorMessage && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2 mb-3">
          <p className="text-xs text-red-400">{post.errorMessage}</p>
        </div>
      )}

      {/* Schedule time */}
      {post.scheduledAt && (
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
          <Clock className="size-3" />
          {new Date(post.scheduledAt).toLocaleString()}
        </div>
      )}

      {/* Analytics (if published) */}
      {post.status === 'PUBLISHED' && (
        <div className="flex items-center gap-4 pt-3 border-t border-gray-800">
          {post.views !== undefined && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Eye className="size-3" />
              {formatNumber(post.views)}
            </div>
          )}
          {post.likes !== undefined && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Heart className="size-3" />
              {formatNumber(post.likes)}
            </div>
          )}
          {post.comments !== undefined && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <MessageSquare className="size-3" />
              {formatNumber(post.comments)}
            </div>
          )}
          {post.shares !== undefined && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Share2 className="size-3" />
              {formatNumber(post.shares)}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export default SocialPostCard;
