"use client";

import { useState, useEffect } from "react";
import { X, Save, Trash2, Calendar, Flag, Clock, CheckSquare, MessageSquare, Paperclip, Activity, Layout } from "lucide-react";
import { useTaskDetails, useUpdateTask, useDeleteTask } from "@/lib/api-hooks";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api-hooks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SubtaskList } from "./subtask-list";
import { CommentThread } from "./comment-thread";
import { FileUpload } from "./file-upload";
import { AttachmentList } from "./attachment-list";
import { ActivityFeed } from "./activity-feed";
import { Tag as TagIcon, Plus } from "lucide-react";
import { useTags, useAssignTagToTask, useRemoveTagFromTask } from "@/lib/api-hooks";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CreateTagDialog } from "@/components/tag/create-tag-dialog";

interface TaskDetailPanelProps {
  taskId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PRIORITY_CONFIG = {
  LOW: { label: "Baja", color: "bg-slate-500", textColor: "text-slate-600", icon: Flag },
  MEDIUM: { label: "Media", color: "bg-blue-500", textColor: "text-blue-600", icon: Flag },
  HIGH: { label: "Alta", color: "bg-orange-500", textColor: "text-orange-600", icon: Flag },
  URGENT: { label: "Urgente", color: "bg-red-500", textColor: "text-red-600", icon: Activity },
};

const STATUS_CONFIG = {
  TODO: { label: "Por Hacer", color: "bg-slate-500", variant: "outline" },
  IN_PROGRESS: { label: "En Progreso", color: "bg-blue-500", variant: "default" },
  COMPLETED: { label: "Completada", color: "bg-green-500", variant: "default" },
  CANCELLED: { label: "Cancelada", color: "bg-red-500", variant: "destructive" },
};

type TabType = "subtasks" | "comments" | "attachments" | "activity";

export function TaskDetailPanel({
  taskId,
  open,
  onOpenChange,
}: TaskDetailPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("subtasks");
  const [showCreateTagDialog, setShowCreateTagDialog] = useState(false);
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch task data with all details (comments, attachments, activities)
  const { data: task, isLoading } = useTaskDetails(taskId as string);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: "",
    estimatedTime: "",
  });

  // Update form when task loads
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        status: task.status || "TODO",
        priority: task.priority || "MEDIUM",
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
        estimatedTime: task.estimatedTime?.toString() || "",
      });
    }
  }, [task]);

  // Update task mutation
  const updateTask = useUpdateTask();

  // Delete task mutation
  const deleteTask = useDeleteTask();

  // Tag management
  const { selectedWorkspaceId } = useWorkspaceStore();
  const { data: availableTags } = useTags(selectedWorkspaceId || "");
  const assignTag = useAssignTagToTask();
  const removeTag = useRemoveTagFromTask();

  const handleSave = () => {
    if (!taskId) return;

    updateTask.mutate({
      taskId,
      data: {
        title: formData.title,
        description: formData.description,
        status: formData.status as any,
        priority: formData.priority as any,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
        estimatedTime: formData.estimatedTime ? parseInt(String(formData.estimatedTime)) : undefined,
      }
    }, {
      onSuccess: () => {
        toast.success("Tarea actualizada");
        setIsEditing(false);
      },
      onError: (error: any) => {
        toast.error(error.message || "Error al actualizar tarea");
      }
    });
  };

  const handleDelete = () => {
    if (!taskId) return;
    if (confirm("¿Estás seguro de eliminar esta tarea?")) {
      deleteTask.mutate(taskId, {
        onSuccess: () => {
          toast.success("Tarea eliminada");
          onOpenChange(false);
        },
        onError: (error: any) => {
          toast.error(error.message || "Error al eliminar tarea");
        }
      });
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!taskId) return null;

  const priorityInfo = PRIORITY_CONFIG[formData.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.MEDIUM;
  const statusInfo = STATUS_CONFIG[formData.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.TODO;
  const PriorityIcon = priorityInfo.icon;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-xl md:max-w-2xl p-0 gap-0 overflow-hidden flex flex-col bg-background"
        hideCloseButton
      >
        <SheetTitle className="sr-only">
          {task?.title || "Detalles de la tarea"}
        </SheetTitle>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Header Area */}
            <div className="px-6 py-5 border-b bg-muted/10">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1 space-y-4">
                  {/* Status & Priority Badges */}
                  <div className="flex items-center gap-2">
                    <Select
                      value={formData.status}
                      onValueChange={(value) => {
                        handleFieldChange("status", value);
                        // Auto-save status changes
                        updateTask.mutate(
                          { taskId, data: { status: value as any } },
                          {
                            onSuccess: () => toast.success("Estado actualizado"),
                            onError: (error: any) => {
                              toast.error(error.message || "Error al actualizar estado");
                              // Revert local change on error
                              handleFieldChange("status", task?.status || "TODO");
                            },
                          }
                        );
                      }}
                    >
                      <SelectTrigger className={cn("h-8 text-xs w-auto gap-2 border-transparent bg-secondary/50 hover:bg-secondary/80 focus:ring-0")}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <div className={cn("w-2 h-2 rounded-full", config.color)} />
                              {config.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={formData.priority}
                      onValueChange={(value) => {
                        handleFieldChange("priority", value);
                        // Auto-save priority changes
                        updateTask.mutate(
                          { taskId, data: { priority: value as any } },
                          {
                            onSuccess: () => toast.success("Prioridad actualizada"),
                            onError: (error: any) => {
                              toast.error(error.message || "Error al actualizar prioridad");
                              // Revert local change on error
                              handleFieldChange("priority", task?.priority || "MEDIUM");
                            },
                          }
                        );
                      }}
                    >
                      <SelectTrigger className={cn("h-8 text-xs w-auto gap-2 border-transparent bg-secondary/50 hover:bg-secondary/80 focus:ring-0")}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <config.icon className={cn("w-3 h-3", config.textColor)} />
                              {config.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Title */}
                  {isEditing ? (
                    <Input
                      value={formData.title}
                      onChange={(e) => handleFieldChange("title", e.target.value)}
                      className="text-2xl font-bold h-auto py-2 px-3 -ml-3 bg-transparent border-transparent hover:bg-accent/50 focus:bg-background focus:border-input transition-colors"
                      placeholder="Título de la tarea"
                      autoFocus
                    />
                  ) : (
                    <h2
                      className="text-2xl font-bold cursor-text hover:bg-accent/20 rounded px-2 -ml-2 py-1 transition-colors"
                      onClick={() => setIsEditing(true)}
                    >
                      {formData.title}
                    </h2>
                  )}

                  {/* Tags Section - Moved here for better visibility */}
                  <div className="flex flex-wrap items-center gap-2 -ml-2 px-2">
                    <TagIcon className="w-4 h-4 text-muted-foreground" />
                    {task?.tags && task.tags.length > 0 ? (
                      task.tags.map((tag: any) => (
                        <Badge
                          key={tag.id}
                          variant="secondary"
                          className="gap-1.5 pr-1 border hover:shadow-sm transition-shadow"
                          style={{
                            backgroundColor: tag.color + '20',
                            color: tag.color,
                            borderColor: tag.color + '40'
                          }}
                        >
                          {tag.name}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeTag.mutate({ tagId: tag.id, taskId });
                            }}
                            className="hover:bg-background/30 rounded-full p-0.5 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Sin etiquetas</span>
                    )}
                    <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs gap-1 rounded-full px-2 hover:bg-accent"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Añadir etiqueta
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-2 w-64" align="start">
                        <div className="space-y-1">
                          {/* Available Tags */}
                          {availableTags && availableTags.length > 0 ? (
                            <>
                              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                                Etiquetas disponibles
                              </div>
                              {availableTags.map((tag: any) => {
                                const isAssigned = task?.tags?.some((t: any) => t.id === tag.id);
                                if (isAssigned) return null;

                                return (
                                  <button
                                    key={tag.id}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      if (!taskId) {
                                        toast.error("Error: ID de tarea no disponible");
                                        return;
                                      }
                                      assignTag.mutate(
                                        { tagId: tag.id, taskId },
                                        {
                                          onSuccess: () => {
                                            toast.success(`Etiqueta "${tag.name}" asignada`);
                                            setTagPopoverOpen(false);
                                          },
                                          onError: (error: any) => {
                                            toast.error(error.message || "Error al asignar etiqueta");
                                          }
                                        }
                                      );
                                    }}
                                    className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                                  >
                                    <div
                                      className="w-3 h-3 rounded-full flex-shrink-0"
                                      style={{ backgroundColor: tag.color }}
                                    />
                                    <span className="flex-1 text-left">{tag.name}</span>
                                  </button>
                                );
                              })}
                              <Separator className="my-1" />
                            </>
                          ) : (
                            <div className="text-center py-4 text-sm text-muted-foreground">
                              No hay etiquetas disponibles
                            </div>
                          )}

                          {/* Create New Tag Button */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setTagPopoverOpen(false);
                              setShowCreateTagDialog(true);
                            }}
                            className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground text-primary transition-colors cursor-pointer font-medium"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Crear nueva etiqueta</span>
                          </button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-1">
                  {isEditing ? (
                    <Button size="sm" onClick={handleSave} disabled={updateTask.isPending} className="h-9">
                      <Save className="w-4 h-4 mr-2" />
                      Guardar
                    </Button>
                  ) : (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} className="h-9 w-9">
                        <Layout className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="h-9 w-9">
                        <X className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Description & Metadata Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left Column: Description */}
                  <div className="md:col-span-2 space-y-3 flex flex-col">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Descripción
                    </Label>
                    {isEditing ? (
                      <Textarea
                        value={formData.description}
                        onChange={(e) => handleFieldChange("description", e.target.value)}
                        placeholder="Añade una descripción detallada..."
                        className="flex-1 resize-none text-sm"
                      />
                    ) : (
                      <div 
                        className={cn(
                          "prose prose-sm dark:prose-invert max-w-none flex-1 p-4 rounded-lg border-2 border-dashed transition-all",
                          formData.description 
                            ? "border-border/50 bg-muted/20 hover:border-border hover:bg-muted/30" 
                            : "border-border/30 bg-muted/10 hover:border-border/50 hover:bg-muted/20",
                          "cursor-text"
                        )}
                        onClick={() => setIsEditing(true)}
                      >
                        {formData.description ? (
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">{formData.description}</p>
                        ) : (
                          <p className="text-muted-foreground italic text-sm">Sin descripción. Haz clic para añadir una.</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Properties */}
                  <div className="space-y-4">
                    <div className="space-y-4 p-5 rounded-xl bg-gradient-to-br from-muted/40 to-muted/20 border-2 border-border/50 shadow-sm">
                      <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                        <div className="w-1 h-4 bg-primary rounded-full" />
                        Detalles
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-muted-foreground">Fecha de Vencimiento</Label>
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-background/60 border border-border/50 hover:border-border transition-colors">
                            <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <Input
                              type="date"
                              value={formData.dueDate}
                              onChange={(e) => {
                                handleFieldChange("dueDate", e.target.value);
                                if (!isEditing) {
                                  updateTask.mutate({ 
                                    taskId, 
                                    data: { dueDate: e.target.value ? new Date(e.target.value) : undefined }
                                  });
                                }
                              }}
                              className="h-7 text-sm bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                            />
                          </div>
                        </div>

                        <Separator className="my-3" />

                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-muted-foreground">Estimación (horas)</Label>
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-background/60 border border-border/50 hover:border-border transition-colors">
                            <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <Input
                              type="number"
                              value={formData.estimatedTime}
                              onChange={(e) => {
                                handleFieldChange("estimatedTime", e.target.value);
                                if (!isEditing && e.target.value) {
                                  updateTask.mutate({ 
                                    taskId, 
                                    data: { estimatedTime: parseFloat(e.target.value) }
                                  });
                                }
                              }}
                              placeholder="0"
                              className="h-7 text-sm bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                            />
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Tabs Section */}
                <div className="space-y-5">
                  <div className="flex items-center gap-1.5 p-1.5 bg-muted/40 rounded-lg w-fit border border-border/30">
                    <TabButton 
                      active={activeTab === "subtasks"} 
                      onClick={() => setActiveTab("subtasks")}
                      icon={CheckSquare}
                      label="Subtareas"
                      count={task?.subTasks?.length}
                    />
                    <TabButton 
                      active={activeTab === "comments"} 
                      onClick={() => setActiveTab("comments")}
                      icon={MessageSquare}
                      label="Comentarios"
                      count={task?.comments?.length}
                    />
                    <TabButton 
                      active={activeTab === "attachments"} 
                      onClick={() => setActiveTab("attachments")}
                      icon={Paperclip}
                      label="Archivos"
                      count={task?.attachments?.length}
                    />
                    <TabButton 
                      active={activeTab === "activity"} 
                      onClick={() => setActiveTab("activity")}
                      icon={Activity}
                      label="Actividad"
                    />
                  </div>

                  <div className="min-h-[200px] animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {activeTab === "subtasks" && (
                      <SubtaskList taskId={taskId} subtasks={task?.subTasks || []} />
                    )}
                    {activeTab === "comments" && (
                      <CommentThread 
                        taskId={taskId} 
                        comments={(task?.comments || []) as any}
                        currentUserId={task?.creatorId}
                      />
                    )}
                    {activeTab === "attachments" && (
                      <div className="space-y-4">
                        <FileUpload
                          taskId={taskId}
                          onUploadComplete={() => {
                            // Invalidate queries to refresh the attachment list
                            queryClient.invalidateQueries({ queryKey: queryKeys.taskDetails(taskId) });
                            queryClient.invalidateQueries({ queryKey: queryKeys.taskAttachments(taskId) });
                          }}
                        />
                        <AttachmentList
                          taskId={taskId}
                          attachments={task?.attachments || []}
                        />
                      </div>
                    )}
                    {activeTab === "activity" && (
                      <ActivityFeed 
                        taskId={taskId}
                        activities={(task?.activities || []) as any}
                        maxItems={10}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t bg-muted/10 flex justify-between items-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar Tarea
              </Button>
              
              <div className="text-xs text-muted-foreground">
                Creada el {task?.createdAt ? new Date(task.createdAt).toLocaleDateString() : "-"}
              </div>
            </div>
          </>
        )}
      </SheetContent>

      {/* Create Tag Dialog */}
      <CreateTagDialog
        open={showCreateTagDialog}
        onOpenChange={setShowCreateTagDialog}
        workspaceId={selectedWorkspaceId || undefined}
      />
    </Sheet>
  );
}

function TabButton({ 
  active, 
  onClick, 
  icon: Icon, 
  label, 
  count 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: any; 
  label: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
        active 
          ? "bg-background text-foreground shadow-sm" 
          : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
      {count !== undefined && count > 0 && (
        <span className="bg-muted-foreground/10 text-muted-foreground text-[10px] px-1.5 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </button>
  );
}
