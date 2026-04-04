"use client";

import { useState, useMemo } from "react";
import {
  Check,
  ChevronsUpDown,
  Plus,
  Search,
  User,
  FolderKanban,
  ListTodo,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui";
import { Input } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface WorkspaceSelectorItem {
  id: string;
  slug: string;
  name: string;
  color: string;
  stats?: {
    projectCount?: number;
    taskCount?: number;
  };
}

interface WorkspaceSelectorProps {
  workspaces?: WorkspaceSelectorItem[];
  selectedWorkspaceId?: string | null;
  isLoading?: boolean;
  onSelect?: (workspace: WorkspaceSelectorItem) => void;
  onCreateClick?: () => void;
  labels?: {
    create?: string;
    search?: string;
    defaultName?: string;
    noResults?: string;
    stats?: {
      projects?: string;
      tasks?: string;
    };
  };
}

const DEFAULT_LABELS = {
  create: "Create Workspace",
  search: "Search workspaces...",
  defaultName: "My Workspace",
  noResults: "No workspaces found",
  stats: {
    projects: "projects",
    tasks: "tasks",
  },
};

export function WorkspaceSelector({
  workspaces = [],
  selectedWorkspaceId,
  isLoading = false,
  onSelect,
  onCreateClick,
  labels = {},
}: WorkspaceSelectorProps) {
  const t = {
    ...DEFAULT_LABELS,
    ...labels,
    stats: { ...DEFAULT_LABELS.stats, ...labels.stats },
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Filter workspaces by search query
  const filteredWorkspaces = useMemo(() => {
    if (!workspaces) return [];
    if (!searchQuery) return workspaces;
    return workspaces.filter((w) =>
      w.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [workspaces, searchQuery]);

  const selectedWorkspace =
    workspaces?.find((w) => w.id === selectedWorkspaceId) || workspaces?.[0];

  const getWorkspaceColorStyle = (color: string) => ({
    backgroundColor: `${color}15`,
    color: color,
    borderColor: `${color}30`,
  });

  if (isLoading) {
    return (
      <div className="flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-sm">
        <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (!workspaces || workspaces.length === 0) {
    return (
      <button
        onClick={onCreateClick}
        className="flex w-full items-center gap-3 rounded-lg border border-dashed px-3 py-2.5 text-sm hover:bg-accent hover:border-solid transition-all"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
          <Plus className="h-4 w-4 text-primary" />
        </div>
        <span className="font-medium">{t.create}</span>
      </button>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-sm hover:bg-accent hover:shadow-sm transition-all group">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg border transition-all group-hover:scale-105"
            style={getWorkspaceColorStyle(
              selectedWorkspace?.color || "#06b6d4",
            )}
          >
            <User className="h-4 w-4" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="font-medium truncate">
              {selectedWorkspace?.name || t.defaultName}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <span className="flex items-center gap-1">
                <FolderKanban className="h-3 w-3" />
                {selectedWorkspace?.stats?.projectCount || 0}
              </span>
              <span className="flex items-center gap-1">
                <ListTodo className="h-3 w-3" />
                {selectedWorkspace?.stats?.taskCount || 0}
              </span>
            </div>
          </div>
          <ChevronsUpDown className="h-4 w-4 opacity-50 flex-shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80 p-0">
        {/* Search */}
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        {/* Workspaces List */}
        <div className="max-h-[400px] overflow-y-auto p-2">
          {filteredWorkspaces.map((workspace) => {
            const isSelected = selectedWorkspace?.id === workspace.id;

            return (
              <button
                key={workspace.id}
                onClick={() => {
                  onSelect?.(workspace);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-sm transition-all",
                  isSelected ? "bg-accent shadow-sm" : "hover:bg-accent",
                )}
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg border flex-shrink-0"
                  style={getWorkspaceColorStyle(workspace.color)}
                >
                  <User className="h-5 w-5" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="font-medium truncate">{workspace.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <FolderKanban className="h-3 w-3" />
                      {workspace.stats?.projectCount || 0} {t.stats.projects}
                    </span>
                    <span className="flex items-center gap-1">
                      <ListTodo className="h-3 w-3" />
                      {workspace.stats?.taskCount || 0} {t.stats.tasks}
                    </span>
                  </div>
                </div>
                {isSelected && (
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                )}
              </button>
            );
          })}

          {filteredWorkspaces.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {t.noResults}
            </div>
          )}
        </div>

        {/* Create New */}
        <div className="border-t p-2">
          <button
            onClick={() => {
              onCreateClick?.();
              setIsOpen(false);
            }}
            className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-sm hover:bg-accent transition-all"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900 border border-blue-200 dark:border-blue-800">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <span className="font-medium">{t.create}</span>
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
