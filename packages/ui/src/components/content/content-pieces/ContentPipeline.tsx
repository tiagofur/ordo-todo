'use client';

import * as React from 'react';
import { cn } from '../../../utils/index.js';
import { ContentCard } from './ContentCard.js';
import { Plus } from 'lucide-react';
import { Button } from '../../ui/button.js';
import type { ContentPipelineProps, PipelineColumnProps } from '@ordo-todo/ui-shared';

const columnConfig = {
  SCRIPTING: { title: 'Scripting', color: '#EAB308', bgColor: 'bg-yellow-500/10' },
  FILMING: { title: 'Filming', color: '#3B82F6', bgColor: 'bg-blue-500/10' },
  EDITING: { title: 'Editing', color: '#A855F7', bgColor: 'bg-purple-500/10' },
  SCHEDULED: { title: 'Scheduled', color: '#06B6D4', bgColor: 'bg-cyan-500/10' },
  PUBLISHED: { title: 'Published', color: '#22C55E', bgColor: 'bg-green-500/10' },
} as const;

/**
 * PipelineColumn component for a single pipeline stage
 */
export function PipelineColumn({
  status,
  title,
  color,
  children,
  count = 0,
  onDrop,
  isDropTarget = false,
  className,
}: PipelineColumnProps) {
  return (
    <div
      className={cn(
        'flex flex-col w-72 min-w-72 rounded-xl p-3',
        'bg-gray-900/50 border border-gray-800',
        isDropTarget && 'border-cyan-500 ring-2 ring-cyan-500/20',
        className
      )}
    >
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div 
            className="size-3 rounded-full" 
            style={{ backgroundColor: color }}
          />
          <h3 className="font-medium text-gray-200">{title}</h3>
          <span className="text-xs text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">
            {count}
          </span>
        </div>
        <Button variant="ghost" size="icon" className="size-6">
          <Plus className="size-4" />
        </Button>
      </div>

      {/* Column content */}
      <div className="flex-1 space-y-2 overflow-y-auto min-h-[200px] max-h-[calc(100vh-300px)]">
        {children}
      </div>
    </div>
  );
}

/**
 * ContentPipeline (Kanban board) for content workflow management
 */
export function ContentPipeline({
  pipeline,
  onContentClick,
  onStatusChange,
  loading = false,
  className,
}: ContentPipelineProps) {
  const columns = [
    { status: 'SCRIPTING' as const, items: pipeline.scripting },
    { status: 'FILMING' as const, items: pipeline.filming },
    { status: 'EDITING' as const, items: pipeline.editing },
    { status: 'SCHEDULED' as const, items: pipeline.scheduled },
    { status: 'PUBLISHED' as const, items: pipeline.published },
  ];

  if (loading) {
    return (
      <div className={cn('flex gap-4 overflow-x-auto pb-4', className)}>
        {columns.map(({ status }) => (
          <div
            key={status}
            className="w-72 min-w-72 rounded-xl p-3 bg-gray-900/50 border border-gray-800 animate-pulse"
          >
            <div className="h-6 bg-gray-800 rounded mb-4 w-24" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-800 rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex gap-4 overflow-x-auto pb-4', className)}>
      {columns.map(({ status, items }) => {
        const config = columnConfig[status];
        return (
          <PipelineColumn
            key={status}
            status={status}
            title={config.title}
            color={config.color}
            count={items.length}
          >
            {items.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-gray-500 text-sm py-8">
                Drop content here
              </div>
            ) : (
              items.map((content) => (
                <ContentCard
                  key={content.id}
                  content={content}
                  onClick={() => onContentClick?.(content.id)}
                  draggable
                  compact
                />
              ))
            )}
          </PipelineColumn>
        );
      })}
    </div>
  );
}

export default ContentPipeline;
