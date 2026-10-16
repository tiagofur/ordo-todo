'use client';

import * as React from 'react';
import { cn } from '../../../utils/index.js';
import { Badge } from '../../ui/badge.js';
import { Card } from '../../ui/card.js';
import { Button } from '../../ui/button.js';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/dropdown-menu.js';
import { MoreVertical, Lightbulb, Mic, MessageSquare, Mail, Globe, Upload, ArrowRight, Archive } from 'lucide-react';
import type { IdeaCardProps } from '@ordo-todo/ui-shared';

const sourceIcons: Record<string, React.ReactNode> = {
  MANUAL: <Lightbulb className="size-4" />,
  VOICE: <Mic className="size-4" />,
  WHATSAPP: <MessageSquare className="size-4 text-green-500" />,
  TELEGRAM: <MessageSquare className="size-4 text-blue-500" />,
  EMAIL: <Mail className="size-4" />,
  BROWSER: <Globe className="size-4" />,
  IMPORT: <Upload className="size-4" />,
};

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  PROMOTED: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  ARCHIVED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  GRAVEYARDED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

/**
 * IdeaCard component for displaying ideas in the Ideas Bank
 * Supports compact and full modes, with actions for promote, archive, edit
 */
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
  const handleClick = onClick ?? onPress;

  return (
    <Card
      data-testid={testID}
      className={cn(
        'group relative transition-all cursor-pointer',
        'hover:border-gray-600 hover:shadow-lg hover:shadow-black/20',
        selected && 'border-cyan-500 ring-2 ring-cyan-500/20',
        compact ? 'p-3' : 'p-4',
        className
      )}
      onClick={handleClick}
    >
      {/* Header: Source icon + Status */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {sourceIcons[idea.source] || <Lightbulb className="size-4" />}
          <Badge
            variant="outline"
            className={cn('text-xs', statusColors[idea.status])}
          >
            {idea.status.toLowerCase()}
          </Badge>
        </div>

        {/* Actions dropdown */}
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
            {onPromote && idea.status === 'ACTIVE' && (
              <DropdownMenuItem onClick={onPromote}>
                <ArrowRight className="size-4 mr-2" />
                Promote to Content
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem onClick={onEdit}>
                Edit
              </DropdownMenuItem>
            )}
            {onArchive && idea.status === 'ACTIVE' && (
              <DropdownMenuItem onClick={onArchive}>
                <Archive className="size-4 mr-2" />
                Archive
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Title */}
      <h3 className={cn(
        'font-medium text-gray-100 mb-1 line-clamp-2',
        compact ? 'text-sm' : 'text-base'
      )}>
        {idea.title}
      </h3>

      {/* Description (only in full mode) */}
      {!compact && idea.description && (
        <p className="text-sm text-gray-400 line-clamp-2 mb-3">
          {idea.description}
        </p>
      )}

      {/* Tags */}
      {idea.tags && idea.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {idea.tags.slice(0, compact ? 2 : 5).map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="text-xs"
              style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
            >
              {tag.name}
            </Badge>
          ))}
          {idea.tags.length > (compact ? 2 : 5) && (
            <Badge variant="secondary" className="text-xs">
              +{idea.tags.length - (compact ? 2 : 5)}
            </Badge>
          )}
        </div>
      )}

      {/* Date (only in full mode) */}
      {!compact && (
        <p className="text-xs text-gray-500 mt-3">
          {new Date(idea.createdAt).toLocaleDateString()}
        </p>
      )}
    </Card>
  );
}

export default IdeaCard;
