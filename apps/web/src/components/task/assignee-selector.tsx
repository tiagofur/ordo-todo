"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage, Popover, PopoverContent, PopoverTrigger } from "@ordo-todo/ui";
import { User, Check, X, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceMembers, useUpdateTask } from "@/lib/api-hooks";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { notify } from "@/lib/notify";

interface AssigneeSelectorProps {
  taskId: string;
  currentAssignee?: {
    id: string;
    name: string;
    image?: string;
  } | null;
  onAssigneeChange?: (assigneeId: string | null) => void;
  variant?: "compact" | "full";
}

export function AssigneeSelector({
  taskId,
  currentAssignee,
  onAssigneeChange,
  variant = "compact",
}: AssigneeSelectorProps) {
  const [open, setOpen] = useState(false);
  const { selectedWorkspaceId } = useWorkspaceStore();
  const { data: members = [], isLoading } = useWorkspaceMembers(
    selectedWorkspaceId || ""
  );
  const updateTask = useUpdateTask();

  const handleSelectAssignee = async (userId: string | null) => {
    try {
      await updateTask.mutateAsync({
        taskId,
        data: { assigneeId: userId },
      });
      onAssigneeChange?.(userId);
      notify.success(userId ? "Tarea asignada" : "Asignación removida");
      setOpen(false);
    } catch (error) {
      notify.error("Error al asignar la tarea");
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (variant === "compact") {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all duration-200",
              "hover:bg-muted/80 border border-transparent hover:border-border/50",
              currentAssignee
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {currentAssignee ? (
              <>
                <Avatar className="h-5 w-5">
                  <AvatarImage src={currentAssignee.image} />
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                    {getInitials(currentAssignee.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="max-w-[100px] truncate">
                  {currentAssignee.name}
                </span>
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <span>Asignar</span>
              </>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="start">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground px-2 py-1">
              Miembros del workspace
            </p>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
              </div>
            ) : members.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay miembros en este workspace
              </p>
            ) : (
              <div className="space-y-1">
                {/* Unassign option */}
                {currentAssignee && (
                  <button
                    onClick={() => handleSelectAssignee(null)}
                    className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted/80 transition-colors text-left group"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <X className="h-4 w-4" />
                    </div>
                    <span className="text-sm text-muted-foreground group-hover:text-foreground">
                      Sin asignar
                    </span>
                  </button>
                )}

                {/* Members list */}
                {members.map((member: any) => (
                  <button
                    key={member.id}
                    onClick={() => handleSelectAssignee(member.user.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors text-left",
                      currentAssignee?.id === member.user.id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted/80"
                    )}
                  >
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={member.user.image} />
                      <AvatarFallback
                        className={cn(
                          "text-xs",
                          currentAssignee?.id === member.user.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        {getInitials(member.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {member.user.name || member.user.email}
                      </p>
                      {member.user.name && (
                        <p className="text-xs text-muted-foreground truncate">
                          {member.user.email}
                        </p>
                      )}
                    </div>
                    {currentAssignee?.id === member.user.id && (
                      <Check className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Full variant (for task detail panel)
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <User className="h-4 w-4" />
        Asignado a
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-muted/30",
              "hover:bg-muted/50 hover:border-border transition-all duration-200 text-left"
            )}
          >
            {currentAssignee ? (
              <>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentAssignee.image} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {getInitials(currentAssignee.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {currentAssignee.name}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="text-sm text-muted-foreground">
                  Sin asignar - Click para asignar
                </span>
              </>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-2" align="start">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground px-2 py-1">
              Seleccionar miembro
            </p>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            ) : members.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No hay miembros en este workspace
              </p>
            ) : (
              <div className="space-y-1">
                {currentAssignee && (
                  <button
                    onClick={() => handleSelectAssignee(null)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-destructive/10 transition-colors text-left group"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                      <X className="h-4 w-4" />
                    </div>
                    <span className="text-sm text-destructive">
                      Remover asignación
                    </span>
                  </button>
                )}

                {currentAssignee && <div className="border-t border-border/50 my-1" />}

                {members.map((member: any) => (
                  <button
                    key={member.id}
                    onClick={() => handleSelectAssignee(member.user.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left",
                      currentAssignee?.id === member.user.id
                        ? "bg-primary/10"
                        : "hover:bg-muted/80"
                    )}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.user.image} />
                      <AvatarFallback
                        className={cn(
                          "text-xs",
                          currentAssignee?.id === member.user.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        {getInitials(member.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm font-medium truncate",
                          currentAssignee?.id === member.user.id && "text-primary"
                        )}
                      >
                        {member.user.name || member.user.email}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {member.role}
                      </p>
                    </div>
                    {currentAssignee?.id === member.user.id && (
                      <Check className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
