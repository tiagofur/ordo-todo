'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui';
import type { UserPresence } from '@/hooks/use-collaboration-socket';
import { Users } from 'lucide-react';

interface PresenceAvatarsProps {
  users: UserPresence[];
  currentUserId?: string;
  max?: number;
  size?: 'sm' | 'md';
  emptyLabel?: string;
}

export function PresenceAvatars({
  users = [],
  currentUserId,
  max = 4,
  size = 'sm',
  emptyLabel,
}: PresenceAvatarsProps) {
  // Filter out duplicate userIds (keep latest)
  const uniqueUsers = React.useMemo(() => {
    const map = new Map<string, UserPresence>();
    for (const u of users) {
      if (u.userId) {
        map.set(u.userId, u);
      }
    }
    return Array.from(map.values());
  }, [users]);

  if (uniqueUsers.length === 0) {
    if (!emptyLabel) return null;
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Users className="w-3.5 h-3.5 opacity-60" />
        <span>{emptyLabel}</span>
      </div>
    );
  }

  const visibleUsers = uniqueUsers.slice(0, max);
  const remainingCount = uniqueUsers.length - max;

  const sizeClasses = size === 'sm' ? 'h-6 w-6 text-[10px]' : 'h-8 w-8 text-xs';

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center -space-x-1.5 overflow-hidden">
        {visibleUsers.map((user) => {
          const isCurrent = user.userId === currentUserId;
          const initials = (user.userName || 'U')
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();

          return (
            <Tooltip key={user.userId}>
              <TooltipTrigger asChild>
                <div className="relative cursor-pointer transition-transform hover:scale-110 hover:z-10">
                  <Avatar className={`${sizeClasses} border-2 border-background ring-1 ring-border`}>
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-background" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                <span className="font-semibold">{user.userName || 'User'}</span>
                {isCurrent && <span className="ml-1 text-muted-foreground">(You)</span>}
                <div className="text-[10px] text-muted-foreground">Active now</div>
              </TooltipContent>
            </Tooltip>
          );
        })}

        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`flex items-center justify-center rounded-full bg-muted border-2 border-background ring-1 ring-border text-muted-foreground font-medium ${sizeClasses}`}
              >
                +{remainingCount}
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {remainingCount} more active {remainingCount === 1 ? 'user' : 'users'}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
