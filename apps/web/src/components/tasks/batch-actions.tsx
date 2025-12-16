"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare,
  Square,
  Trash2,
  Tag,
  Calendar,
  Flag,
  FolderOpen,
  MoreHorizontal,
  X,
  ChevronDown,
} from "lucide-react";
import { 
  Button, 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@ordo-todo/ui";
import { cn } from "@/lib/utils";

interface BatchActionsBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDelete: () => void;
  onComplete: () => void;
  onChangePriority: (priority: "HIGH" | "MEDIUM" | "LOW" | "NONE") => void;
  onMoveToProject: (projectId: string) => void;
  onAddTag: (tagId: string) => void;
  onSetDueDate: (date: Date | null) => void;
  projects?: Array<{ id: string; name: string; color: string }>;
  tags?: Array<{ id: string; name: string; color: string }>;
}

export function BatchActionsBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onDelete,
  onComplete,
  onChangePriority,
  onMoveToProject,
  onAddTag,
  onSetDueDate,
  projects = [],
  tags = [],
}: BatchActionsBarProps) {
  const isVisible = selectedCount > 0;

  const priorities = [
    { value: "HIGH" as const, label: "Alta", color: "text-red-500" },
    { value: "MEDIUM" as const, label: "Media", color: "text-yellow-500" },
    { value: "LOW" as const, label: "Baja", color: "text-blue-500" },
    { value: "NONE" as const, label: "Sin prioridad", color: "text-gray-500" },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
        >
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-card border shadow-2xl">
            {/* Selection info */}
            <div className="flex items-center gap-2 pr-3 border-r border-border">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onDeselectAll}
              >
                <X className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                {selectedCount} de {totalCount} seleccionadas
              </span>
              {selectedCount < totalCount && (
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-primary"
                  onClick={onSelectAll}
                >
                  Seleccionar todas
                </Button>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Complete */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onComplete}
                className="gap-2"
              >
                <CheckSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Completar</span>
              </Button>

              {/* Priority */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Flag className="h-4 w-4" />
                    <span className="hidden sm:inline">Prioridad</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center">
                  {priorities.map((priority) => (
                    <DropdownMenuItem
                      key={priority.value}
                      onClick={() => onChangePriority(priority.value)}
                      className={priority.color}
                    >
                      <Flag className="h-4 w-4 mr-2" />
                      {priority.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Move to project */}
              {projects.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <FolderOpen className="h-4 w-4" />
                      <span className="hidden sm:inline">Mover</span>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="max-h-64 overflow-y-auto">
                    {projects.map((project) => (
                      <DropdownMenuItem
                        key={project.id}
                        onClick={() => onMoveToProject(project.id)}
                      >
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: project.color }}
                        />
                        {project.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Add tag */}
              {tags.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Tag className="h-4 w-4" />
                      <span className="hidden sm:inline">Tag</span>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="max-h-64 overflow-y-auto">
                    {tags.map((tag) => (
                      <DropdownMenuItem
                        key={tag.id}
                        onClick={() => onAddTag(tag.id)}
                      >
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Due date */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="hidden sm:inline">Fecha</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center">
                  <DropdownMenuItem onClick={() => onSetDueDate(new Date())}>
                    Hoy
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    onSetDueDate(tomorrow);
                  }}>
                    Mañana
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    const nextWeek = new Date();
                    nextWeek.setDate(nextWeek.getDate() + 7);
                    onSetDueDate(nextWeek);
                  }}>
                    Próxima semana
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onSetDueDate(null)}>
                    Sin fecha
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* More actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={onDelete}
                    className="text-red-500 focus:text-red-500"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar seleccionadas
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for managing batch selection
export function useBatchSelection<T extends { id: string }>(items: T[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(items.map((item) => item.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const isSelected = (id: string) => selectedIds.has(id);

  const selectedItems = items.filter((item) => selectedIds.has(item.id));

  return {
    selectedIds,
    selectedItems,
    selectedCount: selectedIds.size,
    toggleSelection,
    selectAll,
    deselectAll,
    isSelected,
  };
}
