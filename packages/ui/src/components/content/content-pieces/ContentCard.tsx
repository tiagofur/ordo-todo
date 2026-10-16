'use client';

import * as React from 'react';
import { cn } from '../../../utils/index.js';
import { Badge } from '../../ui/badge.js';
import { Card } from '../../ui/card.js';
import { Button } from '../../ui/button.js';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/dropdown-menu.js';
import { 
  MoreVertical, 
  FileText, 
  Video, 
  Calendar, 
  CheckCircle2,
  GripVertical,
  Edit,
  Trash,
  ArrowRight
} from 'lucide-react';
import type { ContentCardProps } from '@ordo-todo/ui-shared';

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  SCRIPTING: { 
    label: 'Scripting', 
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    icon: <FileText className="size-3" />
  },
  FILMING: { 
    label: 'Filming', 
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    icon: <Video className="size-3" />
  },
  EDITING: { 
    label: 'Editing', 
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    icon: <Video className="size-3" />
  },
  SCHEDULED: { 
    label: 'Scheduled', 
    color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    icon: <Calendar className="size-3" />
  },
  PUBLISHED: { 
    label: 'Published', 
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
    icon: <CheckCircle2 className="size-3" />
  },
  ARCHIVED: { 
    label: 'Archived', 
    color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    icon: null
  },
};

const defaultStatus = statusConfig.SCRIPTING;

function getStatusConfig(status: string) {
  return statusConfig[status] ?? defaultStatus!;
}

/**
 * ContentCard component for displaying content pieces in the Pipeline
 * Supports drag & drop with visual feedback
 */
export function ContentCard({
  content,
  onClick,
  onPress,
  draggable = false,
  isDragging = false,
  compact = false,
  className,
  testID,
}: ContentCardProps) {
  const handleClick = onClick ?? onPress;
  const status = getStatusConfig(content.status);

  return (
    <Card
      data-testid={testID}
      className={cn(
        'group relative transition-all',
        'hover:border-gray-600 hover:shadow-lg hover:shadow-black/20',
        isDragging && 'opacity-50 shadow-xl rotate-2',
        compact ? 'p-3' : 'p-4',
        onClick || onPress ? 'cursor-pointer' : '',
        className
      )}
      onClick={handleClick}
    >
      {/* Drag handle (if draggable) */}
      {draggable && (
        <div className="absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
          <GripVertical className="size-4 text-gray-500" />
        </div>
      )}

      <div className={cn(draggable && 'pl-4')}>
        {/* Header: Thumbnail + Status */}
        <div className="flex items-start gap-3 mb-2">
          {/* Thumbnail */}
          {content.thumbnailUrl ? (
            <div className="size-12 rounded-lg bg-gray-800 overflow-hidden flex-shrink-0">
              <img
                src={content.thumbnailUrl}
                alt=""
                className="size-full object-cover"
              />
            </div>
          ) : (
            <div className="size-12 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
              <Video className="size-6 text-gray-600" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3 className={cn(
              'font-medium text-gray-100 line-clamp-2',
              compact ? 'text-sm' : 'text-base'
            )}>
              {content.title}
            </h3>

            {/* Series badge */}
            {content.series && (
              <div className="flex items-center gap-1 mt-1">
                <div 
                  className="size-2 rounded-full" 
                  style={{ backgroundColor: content.series.color }}
                />
                <span className="text-xs text-gray-400 truncate">
                  {content.series.name}
                  {content.episodeNumber && ` • Ep ${content.episodeNumber}`}
                </span>
              </div>
            )}
          </div>

          {/* Actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="size-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ArrowRight className="size-4 mr-2" />
                Move to...
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-400">
                <Trash className="size-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Description (only in full mode) */}
        {!compact && content.description && (
          <p className="text-sm text-gray-400 line-clamp-2 mb-3">
            {content.description}
          </p>
        )}

        {/* Footer: Status + Date */}
        <div className="flex items-center justify-between mt-3">
          <Badge
            variant="outline"
            className={cn('text-xs gap-1', status.color)}
          >
            {status.icon}
            {status.label}
          </Badge>

          {content.scheduledAt && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar className="size-3" />
              {new Date(content.scheduledAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

export default ContentCard;
