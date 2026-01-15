'use client';

import * as React from 'react';
import { cn } from '../../../utils/index.js';
import { Badge } from '../../ui/badge.js';
import { Card } from '../../ui/card.js';
import { Button } from '../../ui/button.js';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/dropdown-menu.js';
import { MoreVertical, Folder, Edit, Archive, Trash } from 'lucide-react';
import type { SeriesCardProps } from '@ordo-todo/ui-shared';

const seriesTypeConfig: Record<string, { label: string; color: string }> = {
  EPISODIC: { label: 'Episodic', color: 'bg-blue-500/20 text-blue-400' },
  THEMATIC: { label: 'Thematic', color: 'bg-purple-500/20 text-purple-400' },
  CHALLENGE: { label: 'Challenge', color: 'bg-orange-500/20 text-orange-400' },
  EVERGREEN: { label: 'Evergreen', color: 'bg-green-500/20 text-green-400' },
};

const defaultSeriesType = seriesTypeConfig.EPISODIC;

function getSeriesTypeConfig(type: string) {
  return seriesTypeConfig[type] ?? defaultSeriesType!;
}

/**
 * SeriesCard component for displaying content series
 */
export function SeriesCard({
  series,
  onClick,
  onPress,
  onEdit,
  compact = false,
  className,
  testID,
}: SeriesCardProps) {
  const handleClick = onClick ?? onPress;
  const typeConfig = getSeriesTypeConfig(series.seriesType);

  return (
    <Card
      data-testid={testID}
      className={cn(
        'group relative transition-all cursor-pointer overflow-hidden',
        'hover:border-gray-600 hover:shadow-lg hover:shadow-black/20',
        !series.isActive && 'opacity-60',
        className
      )}
      onClick={handleClick}
    >
      {/* Cover image or color bar */}
      {series.coverImage ? (
        <div className="h-24 w-full overflow-hidden">
          <img
            src={series.coverImage}
            alt=""
            className="size-full object-cover"
          />
        </div>
      ) : (
        <div 
          className="h-3 w-full"
          style={{ backgroundColor: series.color }}
        />
      )}

      <div className={cn(compact ? 'p-3' : 'p-4')}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div 
              className="size-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${series.color}30` }}
            >
              <Folder className="size-4" style={{ color: series.color }} />
            </div>
            <div>
              <h3 className={cn(
                'font-medium text-gray-100 line-clamp-1',
                compact ? 'text-sm' : 'text-base'
              )}>
                {series.name}
              </h3>
              {series.contentCount !== undefined && (
                <span className="text-xs text-gray-500">
                  {series.contentCount} {series.contentCount === 1 ? 'piece' : 'pieces'}
                </span>
              )}
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
              {onEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="size-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>
                <Archive className="size-4 mr-2" />
                {series.isActive ? 'Deactivate' : 'Activate'}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-400">
                <Trash className="size-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Description */}
        {!compact && series.description && (
          <p className="text-sm text-gray-400 line-clamp-2 mb-3">
            {series.description}
          </p>
        )}

        {/* Footer: Type badge */}
        <div className="flex items-center justify-between mt-2">
          <Badge variant="secondary" className={cn('text-xs', typeConfig.color)}>
            {typeConfig.label}
          </Badge>
          {!series.isActive && (
            <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-400">
              Inactive
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}

export default SeriesCard;
