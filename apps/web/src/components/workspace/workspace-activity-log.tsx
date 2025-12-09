"use client";

import { useState } from "react";
import { Clock, User, ChevronLeft, ChevronRight } from "lucide-react";
import { useWorkspaceAuditLogs } from "@/lib/api-hooks";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { formatDistanceToNow } from "date-fns";

interface WorkspaceActivityLogProps {
  workspaceId: string;
}

const ITEMS_PER_PAGE = 10;

export function WorkspaceActivityLog({ workspaceId }: WorkspaceActivityLogProps) {
  const t = useTranslations('WorkspaceActivityLog');
  const [page, setPage] = useState(0);
  
  const { data, isLoading } = useWorkspaceAuditLogs(workspaceId, {
    limit: ITEMS_PER_PAGE,
    offset: page * ITEMS_PER_PAGE,
  });

  const logs = data || [];
  // Note: API doesn't return total count, so we disable pagination for now
  const total = logs.length;
  const totalPages = 1; // Would need pagination info from API

  const getActionIcon = (action: string) => {
    const iconMap: Record<string, string> = {
      WORKSPACE_CREATED: "✨",
      WORKSPACE_UPDATED: "✏️",
      MEMBER_ADDED: "👤",
      MEMBER_REMOVED: "👋",
      MEMBER_INVITED: "📧",
      INVITATION_ACCEPTED: "✅",
      PROJECT_CREATED: "📁",
      PROJECT_DELETED: "🗑️",
      SETTINGS_UPDATED: "⚙️",
      WORKSPACE_ARCHIVED: "📦",
      WORKSPACE_DELETED: "❌",
    };
    return iconMap[action] || "📝";
  };

  const getActionColor = (action: string) => {
    if (action.includes("CREATED") || action.includes("ADDED") || action.includes("ACCEPTED")) {
      return "text-green-600 dark:text-green-400";
    }
    if (action.includes("DELETED") || action.includes("REMOVED")) {
      return "text-red-600 dark:text-red-400";
    }
    if (action.includes("UPDATED")) {
      return "text-blue-600 dark:text-blue-400";
    }
    return "text-gray-600 dark:text-gray-400";
  };

  const formatAction = (action: string) => {
    return action
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-3 mb-4">
          <Clock className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          {t('empty.title')}
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          {t('empty.description')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Activity List */}
      <div className="space-y-3">
        {logs.map((log: any) => (
          <div
            key={log.id}
            className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
          >
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              <span className="text-2xl" role="img" aria-label={log.action}>
                {getActionIcon(log.action)}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    <span className={getActionColor(log.action)}>
                      {formatAction(log.action)}
                    </span>
                  </p>
                  
                  {/* Actor */}
                  {log.actorId && (
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{t('by')} User {log.actorId.slice(0, 8)}</span>
                    </div>
                  )}

                  {/* Payload Details */}
                  {log.payload && Object.keys(log.payload).length > 0 && (
                    <div className="mt-2 p-2 rounded bg-muted/50 text-xs font-mono text-muted-foreground">
                      {JSON.stringify(log.payload, null, 2)}
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                  <Clock className="h-3 w-3" />
                  <span>
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            {t('pagination.showing', {
              from: page * ITEMS_PER_PAGE + 1,
              to: Math.min((page + 1) * ITEMS_PER_PAGE, total),
              total,
            })}
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="text-sm text-muted-foreground">
              {t('pagination.page', { current: page + 1, total: totalPages })}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
