"use client";

import { useState, useEffect } from "react";
import { X, Save, Trash2, Calendar, Flag, Clock, CheckSquare, MessageSquare, Paperclip, Activity, Layout } from "lucide-react";
import { useTaskDetails, useUpdateTask, useDeleteTask } from "@/lib/api-hooks";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/api-hooks";
import { notify } from "@/lib/notify";
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
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";

interface TaskDetailPanelProps {
  taskId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TabType = "subtasks" | "comments" | "attachments" | "activity";

export function TaskDetailPanel({
  taskId,
  open,
  onOpenChange,
}: TaskDetailPanelProps) {
  const t = useTranslations('TaskDetailPanel');
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("subtasks");
  const [showCreateTagDialog, setShowCreateTagDialog] = useState(false);
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const queryClient = useQueryClient();

  // Drag & Drop State
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleGlobalDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleGlobalDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleGlobalDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setDroppedFiles(Array.from(e.dataTransfer.files));
      setActiveTab("attachments");
    }
  };

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

  const PRIORITY_CONFIG = {
    LOW: { label: t('priorities.low'), color: "bg-slate-500", textColor: "text-slate-600", icon: Flag },
    MEDIUM: { label: t('priorities.medium'), color: "bg-blue-500", textColor: "text-blue-600", icon: Flag },
    HIGH: { label: t('priorities.high'), color: "bg-orange-500", textColor: "text-orange-600", icon: Flag },
    URGENT: { label: t('priorities.urgent'), color: "bg-red-500", textColor: "text-red-600", icon: Activity },
  };

  const STATUS_CONFIG = {
    TODO: { label: t('statuses.todo'), color: "bg-slate-500", variant: "outline" },
    IN_PROGRESS: { label: t('statuses.inProgress'), color: "bg-blue-500", variant: "default" },
    COMPLETED: { label: t('statuses.completed'), color: "bg-green-500", variant: "default" },
    CANCELLED: { label: t('statuses.cancelled'), color: "bg-red-500", variant: "destructive" },
  };

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
        notify.success(t('toast.updated'));
        setIsEditing(false);
      },
      onError: (error: any) => {
        notify.error(error.message || t('toast.updateError'));
      }
    });
  };

  const handleDelete = () => {
    if (!taskId) return;
    if (confirm(t('confirmDelete'))) {
      deleteTask.mutate(taskId, {
        onSuccess: () => {
          notify.success(t('toast.deleted'));
          onOpenChange(false);
        },
        onError: (error: any) => {
          notify.error(error.message || t('toast.deleteError'));
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
        className={cn(
          "w-full sm:max-w-xl md:max-w-2xl p-0 gap-0 overflow-hidden flex flex-col bg-background transition-colors",
          isDraggingOver && "bg-accent/20"
        )}
        hideCloseButton
        onDragOver={handleGlobalDragOver}
        onDragLeave={handleGlobalDragLeave}
        onDrop={handleGlobalDrop}
      >
        <SheetTitle className="sr-only">
          {task?.title || t('title')}
        </SheetTitle>
        {isLoading ? (
          <div className="flex flex-col h-full animate-pulse">
             {/* Header Skeleton */}
             <div className="px-6 py-5 border-b bg-muted/10 space-y-4">
               <div className="flex gap-2">
                 <Skeleton className="h-8 w-24" />
                 <Skeleton className="h-8 w-24" />
               </div>
               <Skeleton className="h-10 w-3/4" />
               <div className="flex gap-2">
                 <Skeleton className="h-6 w-16 rounded-full" />
                 <Skeleton className="h-6 w-16 rounded-full" />
               </div>
             </div>
             
             {/* Content Skeleton */}
             <div className="flex-1 p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="md:col-span-2 space-y-3">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-32 w-full" />
                   </div>
                   <div className="space-y-4">
                      <Skeleton className="h-40 w-full rounded-xl" />
                   </div>
                </div>
                <Skeleton className="h-px w-full" />
                <div className="flex gap-2">
                   <Skeleton className="h-8 w-24" />
                   <Skeleton className="h-8 w-24" />
                   <Skeleton className="h-8 w-24" />
                </div>
                <Skeleton className="h-64 w-full" />
             </div>
          </div>
        ) : (
          <div className="flex flex-col h-full animate-in fade-in duration-300">
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
                            onSuccess: () => notify.success(t('toast.statusUpdated')),
                            onError: (error: any) => {
                              notify.error(error.message || t('toast.statusError'));
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
                            onSuccess: () => notify.success(t('toast.priorityUpdated')),
                            onError: (error: any) => {
                              notify.error(error.message || t('toast.priorityError'));
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
                      placeholder={t('titlePlaceholder')}
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
                      <span className="text-xs text-muted-foreground italic">{t('tags.none')}</span>
                    )}
                    <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs gap-1 rounded-full px-2 hover:bg-accent"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          {t('tags.add')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-2 w-64" align="start">
                        <div className="space-y-1">
                          {/* Available Tags */}
                          {availableTags && availableTags.length > 0 ? (
                            <>
                              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                                {t('tags.available')}
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
                                        notify.error(t('toast.noTaskId'));
                                        return;
                                      }
                                      assignTag.mutate(
                                        { tagId: tag.id, taskId },
                                        {
                                          onSuccess: () => {
                                            notify.success(t('toast.tagAssigned', { tagName: tag.name }));
                                            setTagPopoverOpen(false);
                                          },
                                          onError: (error: any) => {
                                            notify.error(error.message || t('toast.tagError'));
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
                              {t('tags.noAvailable')}
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
                            <span>{t('tags.create')}</span>
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
                      {t('buttons.save')}
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
                      {t('description.label')}
                    </Label>
                    {isEditing ? (
                      <Textarea
                        value={formData.description}
                        onChange={(e) => handleFieldChange("description", e.target.value)}
                        placeholder={t('description.placeholder')}
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
                          <p className="text-muted-foreground italic text-sm">{t('description.empty')}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Properties */}
                  <div className="space-y-4">
                    <div className="space-y-4 p-5 rounded-xl bg-gradient-to-br from-muted/40 to-muted/20 border-2 border-border/50 shadow-sm">
                      <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                        <div className="w-1 h-4 bg-primary rounded-full" />
                        {t('details.title')}
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-muted-foreground">{t('details.dueDate')}</Label>
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
                          <Label className="text-xs font-medium text-muted-foreground">{t('details.estimation')}</Label>
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
                      label={t('tabs.subtasks')}
                      count={task?.subTasks?.length}
                    />
                    <TabButton 
                      active={activeTab === "comments"} 
                      onClick={() => setActiveTab("comments")}
                      icon={MessageSquare}
                      label={t('tabs.comments')}
                      count={task?.comments?.length}
                    />
                    <TabButton 
                      active={activeTab === "attachments"} 
                      onClick={() => setActiveTab("attachments")}
                      icon={Paperclip}
                      label={t('tabs.attachments')}
                      count={task?.attachments?.length}
                    />
                    <TabButton 
                      active={activeTab === "activity"} 
                      onClick={() => setActiveTab("activity")}
                      icon={Activity}
                      label={t('tabs.activity')}
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
                          filesToUpload={droppedFiles}
                          onFilesHandled={() => setDroppedFiles([])}
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
                {t('buttons.delete')}
              </Button>
              
              <div className="text-xs text-muted-foreground">
                {t('footer.created')} {task?.createdAt ? new Date(task.createdAt).toLocaleDateString() : "-"}
              </div>
            </div>
          </div>
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
