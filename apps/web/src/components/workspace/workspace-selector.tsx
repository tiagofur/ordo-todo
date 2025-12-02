"use client";

import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useWorkspaces } from "@/lib/api-hooks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useTranslations } from "next-intl";

interface WorkspaceSelectorProps {
  onCreateClick?: () => void;
}

export function WorkspaceSelector({ onCreateClick }: WorkspaceSelectorProps) {
  const t = useTranslations('WorkspaceSelector');
  const { selectedWorkspaceId, setSelectedWorkspaceId } = useWorkspaceStore();

  const { data: workspaces, isLoading } = useWorkspaces();

  const selectedWorkspace = workspaces?.find((w: any) => w.id === selectedWorkspaceId) || workspaces?.[0];

  const getWorkspaceInitial = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const getWorkspaceColor = (type: string) => {
    switch (type) {
      case "PERSONAL":
        return "bg-blue-500/10 text-blue-500";
      case "WORK":
        return "bg-purple-500/10 text-purple-500";
      case "TEAM":
        return "bg-green-500/10 text-green-500";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  if (isLoading) {
    return (
      <div className="flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-sm">
        <div className="h-6 w-6 animate-pulse rounded bg-muted" />
        <div className="h-4 flex-1 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (!workspaces || workspaces.length === 0) {
    return (
      <button
        onClick={onCreateClick}
        className="flex w-full items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-sm hover:bg-accent"
      >
        <Plus className="h-4 w-4" />
        <span>{t('create')}</span>
      </button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-accent">
          <div
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded text-xs font-medium",
              getWorkspaceColor(selectedWorkspace?.type || "PERSONAL")
            )}
          >
            {getWorkspaceInitial(selectedWorkspace?.name || "W")}
          </div>
          <span className="flex-1 truncate text-left">{selectedWorkspace?.name || t('defaultName')}</span>
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>{t('label')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {workspaces.map((workspace: any) => (
          <DropdownMenuItem
            key={workspace.id}
            onClick={() => setSelectedWorkspaceId(workspace.id as string)}
            className="flex items-center gap-2"
          >
            <div
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded text-xs font-medium",
                getWorkspaceColor(workspace.type)
              )}
            >
              {getWorkspaceInitial(workspace.name)}
            </div>
            <span className="flex-1">{workspace.name}</span>
            {selectedWorkspace?.id === workspace.id && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onCreateClick} className="gap-2">
          <Plus className="h-4 w-4" />
          <span>{t('create')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
