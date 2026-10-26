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
import { useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Input,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { useWorkspaces } from "@/lib/api-hooks";
import { useWorkspaceStore } from "@/stores/workspace-store";

export interface WorkspaceSelectorItem {
  id: string;
  slug: string;
  name: string;
  color: string;
  icon?: string;
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
  /** Extra classes para el panel del dropdown (p. ej. max-w dentro de contenedores estrechos) */
  contentClassName?: string;
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

export function WorkspaceSelector({
  workspaces: propWorkspaces,
  selectedWorkspaceId: propSelectedId,
  isLoading: propIsLoading,
  onSelect: propOnSelect,
  onCreateClick,
  contentClassName,
  labels = {},
}: WorkspaceSelectorProps) {
  const tTranslations = useTranslations("WorkspaceSelector");
  const { data: fetchedWorkspaces, isLoading: isFetching } = useWorkspaces();
  const { selectedWorkspaceId: storeSelectedId, setSelectedWorkspaceId } =
    useWorkspaceStore();

  const workspaces: WorkspaceSelectorItem[] = useMemo(() => {
    if (propWorkspaces) return propWorkspaces;
    if (!fetchedWorkspaces) return [];
    return fetchedWorkspaces.map((w: any) => ({
      id: w.id,
      slug: w.slug,
      name: w.name,
      color: w.color || "#2563EB",
      icon: w.icon,
      stats: {
        projectCount: w.stats?.projectCount,
        taskCount: w.stats?.taskCount,
      },
    }));
  }, [propWorkspaces, fetchedWorkspaces]);

  const selectedWorkspaceId =
    propSelectedId !== undefined ? propSelectedId : storeSelectedId;
  const isLoading = propIsLoading !== undefined ? propIsLoading : isFetching;

  const handleSelectWorkspace = (workspace: WorkspaceSelectorItem) => {
    if (propOnSelect) {
      propOnSelect(workspace);
    } else {
      setSelectedWorkspaceId(workspace.id);
    }
  };

  const t = {
    create: labels.create || tTranslations("create"),
    search: labels.search || tTranslations("search"),
    defaultName: labels.defaultName || tTranslations("defaultName"),
    noResults: labels.noResults || tTranslations("noResults"),
    stats: {
      projects: labels.stats?.projects || tTranslations("stats.projects"),
      tasks: labels.stats?.tasks || tTranslations("stats.tasks"),
    },
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
      <div className="flex w-full items-center gap-3 rounded-xl border border-sidebar-border bg-sidebar-accent/20 px-3 py-2 text-sm">
        <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 w-24 animate-pulse rounded bg-muted" />
          <div className="h-2.5 w-16 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (!workspaces || workspaces.length === 0) {
    return (
      <button
        onClick={onCreateClick}
        className="flex w-full items-center gap-3 rounded-xl border border-dashed border-sidebar-border/80 px-3 py-2 text-sm hover:bg-sidebar-accent/50 text-sidebar-foreground transition-all"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
          <Plus className="h-4 w-4" />
        </div>
        <span className="font-medium text-foreground">{t.create}</span>
      </button>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center gap-3 rounded-xl border border-sidebar-border/80 bg-sidebar-accent/30 text-sidebar-foreground px-3 py-2 text-sm hover:bg-sidebar-accent/70 hover:border-sidebar-border transition-all group shadow-2xs">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg border transition-all group-hover:scale-105 shrink-0"
            style={getWorkspaceColorStyle(
              selectedWorkspace?.color || "#06b6d4",
            )}
          >
            {selectedWorkspace?.icon ? (
              <span className="text-sm">{selectedWorkspace.icon}</span>
            ) : (
              <User className="h-4 w-4" />
            )}
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="font-medium truncate text-foreground">
              {selectedWorkspace?.name || t.defaultName}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <span className="flex items-center gap-1">
                <FolderKanban className="h-3 w-3 text-muted-foreground" />
                {selectedWorkspace?.stats?.projectCount || 0}
              </span>
              <span className="flex items-center gap-1">
                <ListTodo className="h-3 w-3 text-muted-foreground" />
                {selectedWorkspace?.stats?.taskCount || 0}
              </span>
            </div>
          </div>
          <ChevronsUpDown className="h-4 w-4 text-muted-foreground/70 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className={cn(
          "w-80 p-0 bg-popover text-popover-foreground border-border shadow-xl rounded-xl",
          contentClassName,
        )}
      >
        {/* Search */}
        <div className="p-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-background text-foreground border-border placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Workspaces List */}
        <div className="max-h-[300px] overflow-y-auto p-2">
          {filteredWorkspaces.map((workspace) => {
            const isSelected = selectedWorkspace?.id === workspace.id;

            return (
              <button
                key={workspace.id}
                onClick={() => {
                  handleSelectWorkspace(workspace);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors text-foreground",
                  isSelected
                    ? "bg-accent font-medium text-accent-foreground"
                    : "hover:bg-accent/60 hover:text-accent-foreground",
                )}
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg border shrink-0"
                  style={getWorkspaceColorStyle(workspace.color)}
                >
                  {workspace.icon ? (
                    <span className="text-base">{workspace.icon}</span>
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="font-medium truncate text-foreground">
                    {workspace.name}
                  </div>
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
                  <Check className="h-4 w-4 text-primary shrink-0" />
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
        <div className="border-t border-border p-2">
          <button
            onClick={() => {
              onCreateClick?.();
              setIsOpen(false);
            }}
            className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary shrink-0">
              <Plus className="h-4 w-4" />
            </div>
            <span className="font-medium">{t.create}</span>
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
