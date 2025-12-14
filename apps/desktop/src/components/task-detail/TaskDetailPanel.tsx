import { useState } from "react";
import {
  X,
  Calendar,
  Clock,
  Tag,
  FolderKanban,
  CheckSquare,
  MessageSquare,
  Paperclip,
  MoreHorizontal,
  Play,
  Trash2,
  Edit3,
  Plus,
  Send,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  cn,
  Button,
  Input,
  Textarea,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ordo-todo/ui";
import type { TaskStatus, TaskPriority } from "@ordo-todo/api-client";

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: Date | string;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface TaskDetailData {
  id: string;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "COMPLETED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate?: Date | string;
  estimatedPomodoros?: number;
  completedPomodoros?: number;
  project?: { id: string; name: string; color: string };
  tags?: { id: string; name: string; color: string }[];
  subtasks?: SubTask[];
  comments?: Comment[];
  attachments?: Attachment[];
  createdAt: Date | string;
  updatedAt?: Date | string;
}

interface TaskDetailPanelProps {
  task: TaskDetailData;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (updates: Partial<TaskDetailData>) => void;
  onDelete?: () => void;
  onStartTimer?: () => void;
  onAddSubtask?: (title: string) => void;
  onToggleSubtask?: (subtaskId: string, completed: boolean) => void;
  onDeleteSubtask?: (subtaskId: string) => void;
  onAddComment?: (content: string) => void;
  onDeleteComment?: (commentId: string) => void;
  className?: string;
}

const STATUS_OPTIONS = [
  { value: "TODO", label: "Por Hacer", color: "#6b7280" },
  { value: "IN_PROGRESS", label: "En Progreso", color: "#3b82f6" },
  { value: "IN_REVIEW", label: "En Revisión", color: "#f59e0b" },
  { value: "COMPLETED", label: "Completado", color: "#22c55e" },
];

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Baja", color: "#10b981" },
  { value: "MEDIUM", label: "Media", color: "#f59e0b" },
  { value: "HIGH", label: "Alta", color: "#f97316" },
  { value: "URGENT", label: "Urgente", color: "#ef4444" },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TaskDetailPanel({
  task,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onStartTimer,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onAddComment,
  onDeleteComment,
  className,
}: TaskDetailPanelProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState(task.description || "");
  const [newSubtask, setNewSubtask] = useState("");
  const [newComment, setNewComment] = useState("");
  const [showSubtasks, setShowSubtasks] = useState(true);
  const [showComments, setShowComments] = useState(true);
  const [showAttachments, setShowAttachments] = useState(true);

  if (!isOpen) return null;

  const handleTitleSave = () => {
    if (editedTitle.trim() && editedTitle !== task.title) {
      onUpdate?.({ title: editedTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleDescriptionSave = () => {
    if (editedDescription !== task.description) {
      onUpdate?.({ description: editedDescription });
    }
    setIsEditingDescription(false);
  };

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      onAddSubtask?.(newSubtask.trim());
      setNewSubtask("");
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment?.(newComment.trim());
      setNewComment("");
    }
  };

  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-full max-w-xl bg-card border-l shadow-xl z-50",
          "transform transition-transform duration-300",
          "overflow-y-auto",
          className
        )}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
            <span className="text-sm text-muted-foreground">Detalle de Tarea</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onStartTimer}>
              <Play className="h-4 w-4 mr-2" />
              Iniciar Timer
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Duplicar tarea</DropdownMenuItem>
                <DropdownMenuItem>Mover a proyecto</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={onDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            {isEditingTitle ? (
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={(e) => e.key === "Enter" && handleTitleSave()}
                className="text-2xl font-bold"
                autoFocus
              />
            ) : (
              <h1
                className="text-2xl font-bold cursor-pointer hover:bg-muted/50 rounded px-2 py-1 -mx-2"
                onClick={() => setIsEditingTitle(true)}
              >
                {task.title}
              </h1>
            )}
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Estado</label>
              <Select
                value={task.status}
                onValueChange={(value) => onUpdate?.({ status: value as TaskStatus })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: option.color }}
                        />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Prioridad</label>
              <Select
                value={task.priority}
                onValueChange={(value) => onUpdate?.({ priority: value as TaskPriority })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: option.color }}
                        />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Descripción</label>
            {isEditingDescription ? (
              <div className="space-y-2">
                <Textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  placeholder="Añadir descripción..."
                  rows={4}
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleDescriptionSave}>Guardar</Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditedDescription(task.description || "");
                      setIsEditingDescription(false);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className="min-h-[60px] p-3 rounded-lg border border-dashed cursor-pointer hover:bg-muted/50"
                onClick={() => setIsEditingDescription(true)}
              >
                {task.description ? (
                  <p className="text-sm whitespace-pre-wrap">{task.description}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Añadir descripción...</p>
                )}
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {task.dueDate && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Vence: {formatDate(task.dueDate)}</span>
              </div>
            )}
            {task.estimatedPomodoros && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  🍅 {task.completedPomodoros || 0}/{task.estimatedPomodoros}
                </span>
              </div>
            )}
            {task.project && (
              <div className="flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-muted-foreground" />
                <Badge
                  variant="outline"
                  style={{ borderColor: task.project.color, color: task.project.color }}
                >
                  {task.project.name}
                </Badge>
              </div>
            )}
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Etiquetas</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    style={{
                      backgroundColor: `${tag.color}20`,
                      color: tag.color,
                      borderColor: tag.color,
                    }}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Subtasks */}
          <div className="border-t pt-4">
            <button
              className="flex items-center gap-2 w-full text-left mb-3"
              onClick={() => setShowSubtasks(!showSubtasks)}
            >
              {showSubtasks ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Subtareas</span>
              {totalSubtasks > 0 && (
                <span className="text-sm text-muted-foreground">
                  ({completedSubtasks}/{totalSubtasks})
                </span>
              )}
            </button>

            {showSubtasks && (
              <div className="space-y-2 pl-6">
                {task.subtasks?.map((subtask) => (
                  <div
                    key={subtask.id}
                    className="flex items-center gap-2 group"
                  >
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      onChange={(e) =>
                        onToggleSubtask?.(subtask.id, e.target.checked)
                      }
                      className="rounded"
                    />
                    <span
                      className={cn(
                        "flex-1 text-sm",
                        subtask.completed && "line-through text-muted-foreground"
                      )}
                    >
                      {subtask.title}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={() => onDeleteSubtask?.(subtask.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}

                {/* Add subtask */}
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    placeholder="Añadir subtarea..."
                    className="h-8 text-sm"
                    onKeyDown={(e) => e.key === "Enter" && handleAddSubtask()}
                  />
                  <Button size="sm" variant="ghost" onClick={handleAddSubtask}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="border-t pt-4">
            <button
              className="flex items-center gap-2 w-full text-left mb-3"
              onClick={() => setShowComments(!showComments)}
            >
              {showComments ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Comentarios</span>
              {task.comments && task.comments.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  ({task.comments.length})
                </span>
              )}
            </button>

            {showComments && (
              <div className="space-y-3 pl-6">
                {task.comments?.map((comment) => (
                  <div key={comment.id} className="bg-muted/50 rounded-lg p-3 group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{comment.author}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(comment.createdAt)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={() => onDeleteComment?.(comment.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                ))}

                {/* Add comment */}
                <div className="flex items-end gap-2">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Añadir comentario..."
                    rows={2}
                    className="text-sm"
                  />
                  <Button size="icon" onClick={handleAddComment}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Attachments */}
          <div className="border-t pt-4">
            <button
              className="flex items-center gap-2 w-full text-left mb-3"
              onClick={() => setShowAttachments(!showAttachments)}
            >
              {showAttachments ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <Paperclip className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Archivos</span>
              {task.attachments && task.attachments.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  ({task.attachments.length})
                </span>
              )}
            </button>

            {showAttachments && (
              <div className="space-y-2 pl-6">
                {task.attachments?.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center gap-3 p-2 rounded-lg border hover:bg-muted/50 cursor-pointer"
                  >
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{attachment.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(attachment.size)}
                      </p>
                    </div>
                  </div>
                ))}

                {(!task.attachments || task.attachments.length === 0) && (
                  <div className="border-2 border-dashed rounded-lg p-4 text-center text-sm text-muted-foreground">
                    <Paperclip className="h-6 w-6 mx-auto mb-2 opacity-50" />
                    <p>Arrastra archivos aquí o haz clic para subir</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer info */}
          <div className="border-t pt-4 text-xs text-muted-foreground">
            <p>Creada: {formatDateTime(task.createdAt)}</p>
            {task.updatedAt && <p>Actualizada: {formatDateTime(task.updatedAt)}</p>}
          </div>
        </div>
      </div>
    </>
  );
}
