"use client";

import { useState, useMemo } from "react";
import { Input, DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@ordo-todo/ui";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, Plus, Search, Briefcase, User, Users, FolderKanban, ListTodo } from "lucide-react";
import { useWorkspaces } from "@/lib/api-hooks";
import { useProjects } from "@/lib/api-hooks";
import { useTasks } from "@/lib/api-hooks";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useTranslations } from "next-intl";

interface WorkspaceSelectorProps {
  onCreateClick?: () => void;
}

interface WorkspaceWithStats {
  id: string;
  name: string;
  type: "PERSONAL" | "WORK" | "TEAM";
  color: string;
  projectCount: number;
  taskCount: number;
}

export function WorkspaceSelector({ onCreateClick }: WorkspaceSelectorProps) {
  const router = useRouter();
  const t = useTranslations('WorkspaceSelector');
  const { selectedWorkspaceId, setSelectedWorkspaceId } = useWorkspaceStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const { data: workspaces, isLoading } = useWorkspaces();

  // Filter workspaces by search query
  const filteredWorkspaces = useMemo(() => {
    if (!workspaces) return [];
    if (!searchQuery) return workspaces;
    return workspaces.filter((w: any) =>
      w.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [workspaces, searchQuery]);

  // Group workspaces by type
  const groupedWorkspaces = useMemo(() => {
    const groups: Record<string, any[]> = {
      PERSONAL: [],
      WORK: [],
      TEAM: [],
    };

    if (!filteredWorkspaces) return groups;

    filteredWorkspaces.forEach((workspace: any) => {
      if (groups[workspace.type]) {
        groups[workspace.type].push(workspace);
      } else {
        // Fallback for unknown types
        groups.PERSONAL.push(workspace);
      }
    });

    return groups;
  }, [filteredWorkspaces]);

  const selectedWorkspace = workspaces?.find((w: any) => w.id === selectedWorkspaceId) || workspaces?.[0];

  const getWorkspaceIcon = (type: string) => {
    switch (type) {
      case "PERSONAL":
        return User;
      case "WORK":
        return Briefcase;
      case "TEAM":
        return Users;
      default:
        return User;
    }
  };

  const getWorkspaceColor = (type: string) => {
    switch (type) {
      case "PERSONAL":
        return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20";
      case "WORK":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      case "TEAM":
        return "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "PERSONAL":
        return t('types.personal');
      case "WORK":
        return t('types.work');
      case "TEAM":
        return t('types.team');
      default:
        return type;
    }
  };

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
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Plus className="h-4 w-4 text-primary" />
        </div>
        <span className="font-medium">{t('create')}</span>
      </button>
    );
  }

  const Icon = getWorkspaceIcon(selectedWorkspace?.type || "PERSONAL");

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-sm hover:bg-accent hover:shadow-sm transition-all group">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg border transition-all group-hover:scale-105",
              getWorkspaceColor(selectedWorkspace?.type || "PERSONAL")
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="font-medium truncate">{selectedWorkspace?.name || t('defaultName')}</div>
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
              placeholder={t('search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        {/* Workspace Groups */}
        <div className="max-h-[400px] overflow-y-auto p-2">
          {Object.entries(groupedWorkspaces).map(([type, workspaces]) => {
            if (workspaces.length === 0) return null;

            return (
              <div key={type} className="mb-3 last:mb-0">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {getTypeLabel(type)}
                </div>
                <div className="space-y-1">
                  {workspaces.map((workspace) => {
                    const WorkspaceIcon = getWorkspaceIcon(workspace.type);
                    const isSelected = selectedWorkspace?.id === workspace.id;

                    return (
                      <button
                        key={workspace.id}
                        onClick={() => {
                          setSelectedWorkspaceId(workspace.id);
                          // Use username/slug pattern for navigation
                          if ((workspace as any).owner?.username) {
                            router.push(`/${(workspace as any).owner.username}/${workspace.slug}`);
                          } else {
                            router.push(`/workspaces/${workspace.slug}`);
                          }
                          setIsOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-sm transition-all",
                          isSelected
                            ? "bg-accent shadow-sm"
                            : "hover:bg-accent/50"
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-lg border flex-shrink-0",
                            getWorkspaceColor(workspace.type)
                          )}
                        >
                          <WorkspaceIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <div className="font-medium truncate">{workspace.name}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <FolderKanban className="h-3 w-3" />
                              {workspace.stats?.projectCount || 0} {t('stats.projects')}
                            </span>
                            <span className="flex items-center gap-1">
                              <ListTodo className="h-3 w-3" />
                              {workspace.stats?.taskCount || 0} {t('stats.tasks')}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {filteredWorkspaces.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {t('noResults')}
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
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <span className="font-medium">{t('create')}</span>
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
