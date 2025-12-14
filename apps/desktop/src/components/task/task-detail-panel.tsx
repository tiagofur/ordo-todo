import { useState, useEffect } from "react";
import { X, Save, Trash2, Calendar, Flag, Clock, CheckSquare, MessageSquare, Paperclip, Activity, Layout, Link2, Target } from "lucide-react";
import { 
  useTaskDetails, 
  useUpdateTask, 
  useDeleteTask,
  useCurrentPeriodObjectives,
  useLinkTaskToKeyResult
} from "@/hooks/api";
import { toast } from "sonner";
import type { TaskStatus, TaskPriority } from "@ordo-todo/api-client";
import {
  cn,
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  VisuallyHidden,
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
} from "@ordo-todo/ui";
import { SubtaskList } from "./subtask-list";
import { CommentThread } from "./comment-thread";
import { FileUpload } from "./file-upload";
import { AttachmentList } from "./attachment-list";
import { ActivityFeed } from "./activity-feed";
import { DependencyList } from "./dependency-list";
import { useQueryClient } from "@tanstack/react-query";

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

type TabType = "subtasks" | "comments" | "attachments" | "activity" | "dependencies";

export function TaskDetailPanel({
  taskId,
  open,
  onOpenChange,
}: TaskDetailPanelProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("subtasks");
  
  // Fetch task data
  const { data: task, isLoading } = useTaskDetails(taskId || "");
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { data: objectives } = useCurrentPeriodObjectives();
  const linkTaskToKR = useLinkTaskToKeyResult();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: "",
    startDate: "",
    scheduledDate: "",
    scheduledTime: "",
    scheduledEndTime: "",
    isTimeBlocked: false,
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
        startDate: task.startDate ? new Date(task.startDate).toISOString().split("T")[0] : "",
        scheduledDate: task.scheduledDate ? new Date(task.scheduledDate).toISOString().split("T")[0] : "",
        scheduledTime: task.scheduledTime || "",
        scheduledEndTime: (task as any).scheduledEndTime || "",
        isTimeBlocked: task.isTimeBlocked || false,
        estimatedTime: task.estimatedTime?.toString() || "",
      });
    }
  }, [task]);

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
        onError: (err) => toast.error("Error al actualizar")
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
          onError: () => toast.error("Error al eliminar")
      });
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!taskId) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-xl md:max-w-2xl p-0 gap-0 overflow-hidden flex flex-col bg-background/95 backdrop-blur-sm"
      >
        <VisuallyHidden>
          <SheetTitle>Detalles de la tarea: {task?.title || "Cargando..."}</SheetTitle>
          <SheetDescription>
            Panel para ver y editar los detalles, subtareas, comentarios y archivos adjuntos de la tarea seleccionada.
          </SheetDescription>
        </VisuallyHidden>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Header Area */}
            <div className="px-6 py-4 border-b bg-muted/10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  {/* Status & Priority Badges */}
                  <div className="flex items-center gap-2">
                    <Select
                      value={formData.status}
                      onValueChange={(value) => {
                        handleFieldChange("status", value);
                        updateTask.mutate({ taskId, data: { status: value as TaskStatus } });
                      }}
                    >
                      <SelectTrigger className={cn("h-7 text-xs w-auto gap-2 border-transparent bg-secondary/50 hover:bg-secondary/80 focus:ring-0")}>
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
                        updateTask.mutate({ taskId, data: { priority: value as TaskPriority } });
                      }}
                    >
                      <SelectTrigger className={cn("h-7 text-xs w-auto gap-2 border-transparent bg-secondary/50 hover:bg-secondary/80 focus:ring-0")}>
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
                      className="text-xl font-bold h-auto py-1 px-2 -ml-2 bg-transparent border-transparent hover:bg-accent/50 focus:bg-background focus:border-input transition-colors"
                      placeholder="Título de la tarea"
                      autoFocus
                    />
                  ) : (
                    <h2 
                      className="text-xl font-bold cursor-text hover:bg-accent/20 rounded px-1 -ml-1 transition-colors"
                      onClick={() => setIsEditing(true)}
                    >
                      {formData.title}
                    </h2>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {isEditing ? (
                    <Button size="sm" onClick={handleSave} disabled={updateTask.isPending}>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar
                    </Button>
                  ) : (
                    <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                      <Layout className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-8">
                {/* Description & Metadata Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Left Column: Description */}
                  <div className="md:col-span-2 space-y-3">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Descripción
                    </Label>
                    {isEditing ? (
                      <Textarea
                        value={formData.description}
                        onChange={(e) => handleFieldChange("description", e.target.value)}
                        placeholder="Añade una descripción detallada..."
                        className="min-h-[150px] resize-none"
                      />
                    ) : (
                      <div 
                        className={cn(
                          "prose prose-sm dark:prose-invert max-w-none min-h-[60px] p-3 rounded-md border border-transparent transition-colors",
                          "hover:border-border hover:bg-accent/10 cursor-text"
                        )}
                        onClick={() => setIsEditing(true)}
                      >
                        {formData.description ? (
                          <p className="whitespace-pre-wrap">{formData.description}</p>
                        ) : (
                          <p className="text-muted-foreground italic">Sin descripción. Haz clic para añadir una.</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Properties */}
                  <div className="space-y-6">
                    <div className="space-y-4 p-4 rounded-lg bg-muted/30 border">
                      <h3 className="font-semibold text-sm mb-4">Detalles</h3>
                      
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Fecha de Vencimiento</Label>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-orange-500" />
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
                            className="h-8 text-sm bg-transparent border-transparent hover:bg-background hover:border-input transition-colors"
                          />
                        </div>
                      </div>

                      {/* Start Date - When task can be started */}
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Fecha de Inicio</Label>
                        <div className="flex items-center gap-2">
                          <CheckSquare className="w-4 h-4 text-green-500" />
                          <Input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => {
                              handleFieldChange("startDate", e.target.value);
                              if (!isEditing) {
                                updateTask.mutate({ 
                                  taskId, 
                                  data: { startDate: e.target.value ? new Date(e.target.value) : undefined }
                                });
                              }
                            }}
                            className="h-8 text-sm bg-transparent border-transparent hover:bg-background hover:border-input transition-colors"
                          />
                        </div>
                      </div>

                      {/* Scheduled Date & Time */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-muted-foreground">Programado</Label>
                          {/* Time Block Toggle */}
                          <label className="flex items-center gap-2 cursor-pointer">
                            <span className="text-xs text-muted-foreground">📅 Time Block</span>
                            <input
                              type="checkbox"
                              checked={formData.isTimeBlocked}
                              onChange={(e) => {
                                handleFieldChange("isTimeBlocked", e.target.checked);
                                if (!isEditing) {
                                  updateTask.mutate({ 
                                    taskId, 
                                    data: { isTimeBlocked: e.target.checked }
                                  });
                                }
                              }}
                              className="h-4 w-4 rounded border-primary"
                            />
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <Input
                            type="date"
                            value={formData.scheduledDate}
                            onChange={(e) => {
                              handleFieldChange("scheduledDate", e.target.value);
                              if (!isEditing) {
                                updateTask.mutate({ 
                                  taskId, 
                                  data: { scheduledDate: e.target.value ? new Date(e.target.value) : undefined }
                                });
                              }
                            }}
                            className="h-8 text-sm bg-transparent border-transparent hover:bg-background hover:border-input transition-colors flex-1"
                          />
                          <Input
                            type="time"
                            value={formData.scheduledTime}
                            onChange={(e) => {
                              handleFieldChange("scheduledTime", e.target.value);
                              if (!isEditing) {
                                updateTask.mutate({ 
                                  taskId, 
                                  data: { scheduledTime: e.target.value || null }
                                });
                              }
                            }}
                            placeholder="Inicio"
                            className="h-8 text-sm bg-transparent border-transparent hover:bg-background hover:border-input transition-colors w-20"
                          />
                          <span className="text-muted-foreground text-xs">-</span>
                          <Input
                            type="time"
                            value={formData.scheduledEndTime}
                            onChange={(e) => {
                              handleFieldChange("scheduledEndTime", e.target.value);
                              if (!isEditing) {
                                updateTask.mutate({ 
                                  taskId, 
                                  data: { scheduledEndTime: e.target.value || null }
                                });
                              }
                            }}
                            placeholder="Fin"
                            className="h-8 text-sm bg-transparent border-transparent hover:bg-background hover:border-input transition-colors w-20"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Estimación (horas)</Label>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
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
                            className="h-8 text-sm bg-transparent border-transparent hover:bg-background hover:border-input transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                       {/* Link to Goal */}
                       <div className="space-y-1.5">
                         <Label className="text-xs text-muted-foreground">Vincular a Objetivo (OKR)</Label>
                         <Select onValueChange={(krid) => {
                             if(!taskId) return;
                             linkTaskToKR.mutate({ keyResultId: krid, data: { taskId, weight: 1 } }, {
                                 onSuccess: () => toast.success("Tarea vinculada a objetivo"),
                                 onError: () => toast.error("Error al vincular")
                             });
                         }}>
                           <SelectTrigger className="h-8 text-sm bg-transparent border-transparent hover:bg-background hover:border-input transition-colors gap-2">
                             <Target className="w-4 h-4 text-pink-500" />
                             <SelectValue placeholder="Seleccionar KR" />
                           </SelectTrigger>
                           <SelectContent>
                             {objectives?.map((obj) => (
                               <div key={obj.id}>
                                 <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/30">
                                   {obj.title}
                                 </div>
                                 {obj.keyResults?.map((kr) => (
                                   <SelectItem key={kr.id} value={kr.id} className="pl-4 text-xs">
                                     {kr.title}
                                   </SelectItem>
                                 ))}
                               </div>
                             ))}
                             {(!objectives || objectives.length === 0) && (
                                <div className="p-2 text-xs text-muted-foreground">No objectives found</div>
                             )}
                           </SelectContent>
                         </Select>
                       </div>

                    </div>
                  </div>

                <Separator />

                {/* Tabs Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-lg w-fit overflow-x-auto max-w-full">
                    <TabButton 
                      active={activeTab === "subtasks"} 
                      onClick={() => setActiveTab("subtasks")}
                      icon={CheckSquare}
                      label="Subtareas"
                      count={task?.subTasks?.length}
                    />
                    <TabButton 
                      active={activeTab === "dependencies"} 
                      onClick={() => setActiveTab("dependencies")}
                      icon={Link2}
                      label="Bloqueos"
                      // count={...} // Need dependencies count
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
                    {activeTab === "dependencies" && (
                      <DependencyList taskId={taskId} projectId={task?.projectId} />
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
                          onUploadComplete={() => queryClient.invalidateQueries({ queryKey: ['tasks', taskId] })}
                        />
                        <AttachmentList 
                          taskId={taskId}
                          attachments={(task?.attachments || []) as any}
                        />
                      </div>
                    )}
                    {activeTab === "activity" && (
                      <ActivityFeed 
                        taskId={taskId}
                        activities={[]} // TODO: Implement task activities fetching
                        maxItems={10}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-muted/10 flex justify-between items-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive transition-colors"
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
        "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap",
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
