'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { toast } from 'sonner';
import {
  X,
  Save,
  Trash2,
  Calendar,
  Flag,
  Clock,
  CheckSquare,
  MessageSquare,
  Paperclip,
  Activity,
  Layout,
  Share2,
  Copy,
  Link as LinkIcon,
  Tag as TagIcon,
  Plus,
  GitBranch,
  ShieldAlert,
  SlidersHorizontal,
  Repeat,
} from 'lucide-react';
import { TaskCustomFieldsEditor } from './task-custom-fields-editor';
import { RecurrenceSelector, type RecurrenceValue } from './recurrence-selector';
import { AssigneeSelector } from './assignee-selector';
import { PresenceAvatars } from '@/components/collaboration/presence-avatars';
import { useCollaborationSocket } from '@/hooks/use-collaboration-socket';
import { apiClient } from '@/lib/api-client';
import { CommentThread } from './comment-thread';
import { AttachmentList } from './attachment-list';
import { formatCalendarDateInput, serializeCalendarDateForApi } from '@ordo-todo/core';
import { useConfirm } from '@/components/shared/confirm-dialog';
import { 
  useTaskComments, 
  useCreateComment, 
  useUpdateComment, 
  useDeleteComment, 
  useWorkspaceMembers,
  useCurrentUser,
  useTaskAttachments,
  useUploadAttachment,
  useDeleteAttachment
} from '@/lib/api-hooks';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Separator,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Skeleton
} from '@/components/ui';

import type {
  TaskDetails,
  UpdateTaskDto,
  Task as TaskType,
  Tag,
  TaskStatus,
  TaskPriority,
  WorkspaceMember
} from "@ordo-todo/api-client";

interface TaskDetailPanelProps {
  taskId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Task Data and State */
  task?: TaskDetails;
  isLoading?: boolean;
  /** Current User Info */
  currentUserId?: string;
  /** Available Tags for assignment */
  availableTags?: Tag[];
  /** Actions */
  onUpdate?: (taskId: string, data: UpdateTaskDto) => Promise<void> | void;
  onDelete?: (taskId: string) => Promise<void> | void;
  onAssignTag?: (taskId: string, tagId: string) => Promise<void> | void;
  onRemoveTag?: (taskId: string, tagId: string) => Promise<void> | void;
  onShare?: (taskId: string) => Promise<void> | void;
  /** Render Props for Sub-components to avoid huge dependency tree */
  renderSubtaskList?: (taskId: string, subtasks: TaskType[]) => ReactNode;
  renderComments?: (taskId: string) => ReactNode;
  renderAttachments?: (taskId: string) => ReactNode;
  renderActivity?: (taskId: string) => ReactNode;
  renderAssigneeSelector?: (taskId: string, currentAssignee: any) => ReactNode; // User type might be complex to import?
  renderCreateTagDialog?: (open: boolean, onOpenChange: (open: boolean) => void) => ReactNode;
  
  /** Labels */
  labels?: {
    title?: string;
    titlePlaceholder?: string;
    descriptionLabel?: string;
    descriptionPlaceholder?: string;
    descriptionEmpty?: string;
    statusTodo?: string;
    statusInProgress?: string;
    statusCompleted?: string;
    statusCancelled?: string;
    priorityLow?: string;
    priorityMedium?: string;
    priorityHigh?: string;
    priorityUrgent?: string;
    dueDate?: string;
    estimation?: string;
    detailsTitle?: string;
    tabsSubtasks?: string;
    tabsComments?: string;
    tabsAttachments?: string;
    tabsActivity?: string;
    tagsNone?: string;
    tagsAdd?: string;
    tagsAvailable?: string;
    tagsNoAvailable?: string;
    tagsCreate?: string;
    btnSave?: string;
    btnDelete?: string;
    footerCreated?: string;
    confirmDelete?: string;
    toastUpdated?: string;
    toastDeleted?: string;
    toastTagAssigned?: (name: string) => string;
    shareTitle?: string;
    shareDescription?: string;
  };
}

const DEFAULT_LABELS = {
  title: 'Task Details',
  titlePlaceholder: 'Task Title',
  descriptionLabel: 'DESCRIPTION',
  descriptionPlaceholder: 'Add a description...',
  descriptionEmpty: 'No description provided.',
  statusTodo: 'To Do',
  statusInProgress: 'In Progress',
  statusCompleted: 'Completed',
  statusCancelled: 'Cancelled',
  priorityLow: 'Low',
  priorityMedium: 'Medium',
  priorityHigh: 'High',
  priorityUrgent: 'Urgent',
  dueDate: 'Due Date',
  estimation: 'Estimated Time (min)',
  detailsTitle: 'Details',
  tabsSubtasks: 'Subtasks',
  tabsComments: 'Comments',
  tabsAttachments: 'Attachments',
  tabsActivity: 'Activity',
  tabsDependencies: 'Dependencies',
  tagsNone: 'No tags',
  tagsAdd: 'Add Tag',
  tagsAvailable: 'Available Tags',
  tagsNoAvailable: 'No tags available',
  tagsCreate: 'Create New Tag',
  btnSave: 'Save',
  btnDelete: 'Delete Task',
  footerCreated: 'Created on',
  confirmDelete: 'Are you sure you want to delete this task?',
  toastUpdated: 'Task updated successfully',
  toastDeleted: 'Task deleted successfully',
  toastTagAssigned: (name: string) => `Tag ${name} assigned`,
  shareTitle: 'Share Task',
  shareDescription: 'Share this link with others to view this task.',
};

export function TaskDetailPanel({
  taskId,
  open,
  onOpenChange,
  task,
  isLoading = false,
  availableTags = [],
  onUpdate,
  onDelete,
  onAssignTag,
  onRemoveTag,
  onShare,
  currentUserId: propCurrentUserId,
  renderSubtaskList,
  renderComments,
  renderAttachments,
  renderActivity,
  renderAssigneeSelector,
  renderCreateTagDialog,
  labels = {},
}: TaskDetailPanelProps) {
  // Merge labels
  const t = { ...DEFAULT_LABELS, ...labels };

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'subtasks' | 'comments' | 'attachments' | 'activity' | 'dependencies' | 'customFields'>('subtasks');
  const [showCreateTagDialog, setShowCreateTagDialog] = useState(false);
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '',
    estimatedMinutes: '',
  });
  const [recurrence, setRecurrence] = useState<RecurrenceValue | null | undefined>(null);

  // Comments & Mentions Logic
  const { data: comments = [] } = useTaskComments(taskId as string);
  const { data: currentUser } = useCurrentUser();
  const currentUserId = currentUser?.id || propCurrentUserId;
  // Only fetch members if we have a task and it has a workspaceId
  const { data: workspaceMembers = [] } = useWorkspaceMembers(task?.project?.workspaceId ?? '');
  
  const createCommentMutation = useCreateComment();
  const updateCommentMutation = useUpdateComment();
  const deleteCommentMutation = useDeleteComment();

  // Collaboration / Real-time Presence
  const { taskUsers } = useCollaborationSocket({
    workspaceId: task?.project?.workspaceId,
    taskId: open && taskId ? taskId : null,
    enabled: open && !!taskId,
    onTaskUpdated: (event) => {
      if (event.updatedBy?.userId !== currentUserId) {
        toast.info(`${event.updatedBy?.userName || 'Another user'} updated this task`, {
          icon: <Activity className="w-4 h-4 text-blue-500" />,
        });
      }
    },
  });

  // Members that can receive an assignment or a mention
  const assignableMembers = workspaceMembers.filter(
    (member: WorkspaceMember) => !!member.user,
  );

  // Transform workspace members to MentionUser format
  const mentionUsers = assignableMembers.map((member: WorkspaceMember) => {
    const user = member.user!;
    return {
      id: user.id,
      name: user.name || 'Unknown',
      image: user.image || undefined,
    };
  });

  // AssigneeSelector expects non-null name/image; fall back to email
  const selectorMembers = assignableMembers.map((member: WorkspaceMember) => ({
    id: member.id,
    role: member.role,
    user: {
      id: member.user!.id,
      name: member.user!.name || member.user!.email,
      email: member.user!.email,
      image: member.user!.image || undefined,
    },
  }));

  const handleCreateComment = async (content: string) => {
    if (!taskId) return;
    try {
      await createCommentMutation.mutateAsync({ taskId, content });
    } catch {
      toast.error('Error al crear comentario');
    }
  };

  const handleUpdateComment = async (commentId: string, content: string) => {
    try {
      await updateCommentMutation.mutateAsync({ commentId, data: { content } });
    } catch {
      toast.error('Error al actualizar comentario');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteCommentMutation.mutateAsync(commentId);
    } catch {
      toast.error('Error al eliminar comentario');
    }
  };

  // Attachments Logic
  const { data: attachments = [] } = useTaskAttachments(taskId as string);
  const uploadAttachmentMutation = useUploadAttachment();
  const deleteAttachmentMutation = useDeleteAttachment();

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!taskId || !e.target.files?.length) return;
    const file = e.target.files[0];
    try {
        await uploadAttachmentMutation.mutateAsync({ file, taskId });
        // Clear input? easier to just use a key or controlled input, but simple is fine for now
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error("Failed to upload", error);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!taskId) return;
    try {
      await deleteAttachmentMutation.mutateAsync(attachmentId);
    } catch {
      toast.error('Error al eliminar archivo adjunto');
    }
  };

  // Dependencies Logic
  const [dependencies, setDependencies] = useState<{ blockedBy: any[]; blocking: any[] }>({
    blockedBy: [],
    blocking: [],
  });
  const [availableProjectTasks, setAvailableProjectTasks] = useState<any[]>([]);
  const [selectedBlockingId, setSelectedBlockingId] = useState<string>('');
  const [isLoadingDeps, setIsLoadingDeps] = useState(false);

  const fetchDependencies = async () => {
    if (!taskId) return;
    setIsLoadingDeps(true);
    try {
      const deps = await apiClient.getTaskDependencies(taskId);
      setDependencies(deps);
      if (task?.projectId) {
        const tasks = await apiClient.getTasks(task.projectId);
        setAvailableProjectTasks(tasks.filter((t: any) => t.id !== taskId));
      }
    } catch {
      // Ignore dependencies error
    } finally {
      setIsLoadingDeps(false);
    }
  };

  const handleAddDependency = async () => {
    if (!taskId || !selectedBlockingId) return;
    try {
      await apiClient.addTaskDependency(taskId, selectedBlockingId);
      toast.success('Dependencia agregada');
      setSelectedBlockingId('');
      fetchDependencies();
    } catch {
      toast.error('Error al agregar dependencia');
    }
  };

  const handleRemoveDependency = async (blockingTaskId: string) => {
    if (!taskId) return;
    try {
      await apiClient.removeTaskDependency(taskId, blockingTaskId);
      toast.success('Dependencia eliminada');
      fetchDependencies();
    } catch {
      toast.error('Error al eliminar dependencia');
    }
  };

  useEffect(() => {
    if (activeTab === 'dependencies' && taskId) {
      fetchDependencies();
    }
  }, [activeTab, taskId]);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'TODO',
        priority: task.priority || 'MEDIUM',
        dueDate: formatCalendarDateInput(task.dueDate),
        estimatedMinutes: task.estimatedMinutes?.toString() || '',
      });
      setRecurrence((task.recurrence as RecurrenceValue) || null);
    }
  }, [task?.id]);

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRecurrenceChange = (val?: RecurrenceValue) => {
    const updated = val || null;
    setRecurrence(updated);
    if (!isEditing && taskId && onUpdate) {
      onUpdate(taskId, { recurrence: updated as any });
    }
  };

  const handleSave = async () => {
     if (!taskId || !onUpdate) return;
     setIsUpdating(true);
     try {
       await onUpdate(taskId, {
         title: formData.title,
         description: formData.description,
         status: formData.status as TaskStatus,
         priority: formData.priority as TaskPriority,
         dueDate: (formData.dueDate ? serializeCalendarDateForApi(formData.dueDate) : null) as any,
         estimatedMinutes: formData.estimatedMinutes ? parseInt(String(formData.estimatedMinutes)) : undefined,
         recurrence: (recurrence ?? null) as any,
       });
       setIsEditing(false);
     } catch {
       toast.error('Error al guardar los cambios');
     } finally {
       setIsUpdating(false);
     }
  };

  const { confirm, ConfirmModal } = useConfirm();

  const handleDelete = async () => {
    if (!taskId || !onDelete) return;
    const ok = await confirm({
      title: t.btnDelete,
      description: t.confirmDelete,
      variant: 'destructive',
    });
    if (ok) {
      try {
        await onDelete(taskId);
        onOpenChange(false);
      } catch {
        toast.error('Error al eliminar la tarea');
      }
    }
  };

  const handleShare = async () => {
    if (!taskId) return;
    if (task?.publicToken) {
      setShowShareDialog(true);
    } else if (onShare) {
      try {
        await onShare(taskId);
        setShowShareDialog(true);
      } catch {
        toast.error('Error al compartir la tarea');
      }
    }
  };

  const copyShareLink = () => {
     const origin = typeof window !== 'undefined' ? window.location.origin : '';
     const url = `${origin}/share/task/${task?.publicToken}`;
     navigator.clipboard.writeText(url);
     // toast logic handled by parent if needed or simple alert, 
     // but ideally we should have a `onNotify` prop if we want to trigger toasts from here
  };

  if (!taskId && !open) return null;

  const PRIORITY_CONFIG = {
    LOW: { label: t.priorityLow, color: 'bg-slate-500', textColor: 'text-slate-600', icon: Flag },
    MEDIUM: { label: t.priorityMedium, color: 'bg-blue-500', textColor: 'text-blue-600', icon: Flag },
    HIGH: { label: t.priorityHigh, color: 'bg-orange-500', textColor: 'text-orange-600', icon: Flag },
    URGENT: { label: t.priorityUrgent, color: 'bg-red-500', textColor: 'text-red-600', icon: Activity },
  };

  const STATUS_CONFIG = {
    TODO: { label: t.statusTodo, color: 'bg-slate-500' },
    IN_PROGRESS: { label: t.statusInProgress, color: 'bg-blue-500' },
    COMPLETED: { label: t.statusCompleted, color: 'bg-green-500' },
    CANCELLED: { label: t.statusCancelled, color: 'bg-red-500' },
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl md:max-w-2xl p-0 gap-0 overflow-hidden flex flex-col bg-background transition-colors"
        hideCloseButton
      >
        <SheetTitle className="sr-only">
          {task?.title || t.title}
        </SheetTitle>

        {isLoading ? (
           <div className="flex flex-col h-full animate-pulse p-6 space-y-4">
             <Skeleton className="h-8 w-1/3" />
             <Skeleton className="h-32 w-full" />
             <Skeleton className="h-64 w-full" />
           </div>
        ) : (
          <div className="flex flex-col h-full animate-in fade-in duration-300">
            {/* Header Area */}
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b bg-muted">
              {/* Mobile-first: Close button always visible at top right */}
              <div className="flex items-center justify-between gap-2 mb-3 sm:mb-0 sm:absolute sm:right-4 sm:top-4 sm:z-10">
                <div className="flex items-center gap-1 sm:hidden">
                  {/* Mobile: Status & Priority inline with close */}
                  <Select
                    value={formData.status}
                    onValueChange={(val: string) => {
                       handleFieldChange('status', val);
                       if(onUpdate && taskId) onUpdate(taskId, { status: val as TaskStatus });
                    }}
                  >
                    <SelectTrigger className="h-7 text-xs w-auto gap-1 border-transparent bg-secondary hover:bg-secondary focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <div className={cn('w-2 h-2 rounded-full', config.color)} />
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={formData.priority}
                    onValueChange={(val: string) => {
                      handleFieldChange('priority', val);
                      if(onUpdate && taskId) onUpdate(taskId, { priority: val as TaskPriority });
                    }}
                  >
                    <SelectTrigger className="h-7 text-xs w-auto gap-1 border-transparent bg-secondary hover:bg-secondary focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                           <div className="flex items-center gap-2">
                             <config.icon className={cn('w-3 h-3', config.textColor)} />
                             {config.label}
                           </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-1">
                  {taskUsers.length > 0 && (
                    <div className="mr-1.5 flex items-center">
                      <PresenceAvatars
                        users={taskUsers}
                        currentUserId={currentUserId}
                        size="sm"
                      />
                    </div>
                  )}
                  {isEditing ? (
                    <Button size="sm" onClick={handleSave} disabled={isUpdating} className="h-8 text-xs">
                      <Save className="w-3.5 h-3.5 sm:mr-1.5" />
                      <span className="hidden sm:inline">{t.btnSave}</span>
                    </Button>
                  ) : (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} className="h-8 w-8">
                        <Layout className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={handleShare} className="h-8 w-8">
                        <Share2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="h-8 w-8">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>

              <div className="sm:flex sm:items-start sm:justify-between sm:gap-6 sm:pr-28">
                <div className="flex-1 space-y-3 sm:space-y-4">
                  {/* Desktop: Status & Priority */}
                  <div className="hidden sm:flex items-center gap-2">
                    <Select
                      value={formData.status}
                      onValueChange={(val: string) => {
                         handleFieldChange('status', val);
                         if(onUpdate && taskId) onUpdate(taskId, { status: val as TaskStatus });
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs w-auto gap-2 border-transparent bg-secondary hover:bg-secondary focus:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <div className={cn('w-2 h-2 rounded-full', config.color)} />
                              {config.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={formData.priority}
                      onValueChange={(val: string) => {
                        handleFieldChange('priority', val);
                        if(onUpdate && taskId) onUpdate(taskId, { priority: val as TaskPriority });
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs w-auto gap-2 border-transparent bg-secondary hover:bg-secondary focus:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                             <div className="flex items-center gap-2">
                               <config.icon className={cn('w-3 h-3', config.textColor)} />
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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange("title", e.target.value)}
                      className="text-xl sm:text-2xl font-bold h-auto py-1.5 sm:py-2 px-2 sm:px-3 -ml-2 sm:-ml-3 bg-transparent border-transparent hover:bg-accent focus:bg-background focus:border-input transition-colors"
                      placeholder={t.titlePlaceholder}
                      autoFocus
                    />
                  ) : (
                    <h2
                      className="text-xl sm:text-2xl font-bold cursor-text hover:bg-accent rounded px-2 -ml-2 py-1 transition-colors break-words"
                      onClick={() => setIsEditing(true)}
                    >
                      {formData.title}
                    </h2>
                  )}
                  
                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-2 -ml-2 px-2">
                    <TagIcon className="w-4 h-4 text-muted-foreground" />
                    {task?.tags && task.tags.length > 0 ? (
                      task.tags.map((tag) => (
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
                              if (taskId && onRemoveTag) onRemoveTag(taskId, tag.id);
                            }}
                            className="hover:bg-background rounded-full p-0.5 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground italic">{t.tagsNone}</span>
                    )}
                    
                    <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
                      <PopoverTrigger asChild>
                         <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs gap-1 rounded-full px-2 hover:bg-accent"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          {t.tagsAdd}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-2 w-64" align="start">
                         <div className="space-y-1">
                           <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                             {t.tagsAvailable}
                           </div>
                           {availableTags.length > 0 ? (
                             availableTags.map((tag) => {
                               const isAssigned = task?.tags?.some(t => t.id === tag.id);
                               if (isAssigned) return null;
                               return (
                                  <button
                                    key={tag.id}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      if (taskId && onAssignTag) {
                                        onAssignTag(taskId, tag.id);
                                        setTagPopoverOpen(false);
                                      }
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
                             })
                           ) : (
                              <div className="text-center py-4 text-sm text-muted-foreground">
                                {t.tagsNoAvailable}
                              </div>
                           )}
                           <Separator className="my-1" />
                           <button
                             onClick={() => {
                               setTagPopoverOpen(false);
                               setShowCreateTagDialog(true);
                             }}
                             className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground text-primary transition-colors cursor-pointer font-medium"
                           >
                             <Plus className="w-4 h-4" />
                             <span>{t.tagsCreate}</span>
                           </button>
                         </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
               <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 min-w-0">
                 {/* Metadata Grid */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    <div className="md:col-span-2 space-y-3 flex flex-col min-w-0">
                       <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                         {t.descriptionLabel}
                       </Label>
                       {isEditing ? (
                         <Textarea
                           value={formData.description}
                           onChange={(e) => handleFieldChange("description", e.target.value)}
                           placeholder={t.descriptionPlaceholder}
                           className="flex-1 resize-none text-sm"
                         />
                       ) : (
                         <div
                           className={cn(
                             "prose prose-sm dark:prose-invert max-w-none flex-1 p-3 sm:p-4 rounded-lg border-2 border-dashed transition-all overflow-hidden",
                             formData.description
                               ? "border-border bg-muted hover:border-border hover:bg-muted"
                               : "border-border bg-muted hover:border-border hover:bg-muted",
                             "cursor-text"
                           )}
                           onClick={() => setIsEditing(true)}
                         >
                           {formData.description ? (
                             <p className="whitespace-pre-wrap text-sm leading-relaxed break-words">{formData.description}</p>
                           ) : (
                             <p className="text-muted-foreground italic text-sm">{t.descriptionEmpty}</p>
                           )}
                         </div>
                       )}
                    </div>
                    
                    <div className="space-y-4 min-w-0">
                      <div className="space-y-4 p-4 sm:p-5 rounded-xl bg-muted border-2 border-border shadow-sm">
                        <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                           <div className="w-1 h-4 bg-primary rounded-full flex-shrink-0" />
                           {t.detailsTitle}
                        </h3>
                        
                        <div className="space-y-4">
                           <div className="space-y-2">
                             <Label className="text-xs font-medium text-muted-foreground">{t.dueDate}</Label>
                             <div className="flex items-center gap-2 p-2 rounded-lg bg-background border border-border hover:border-border transition-colors">
                               <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                               <Input
                                  type="date"
                                  value={formData.dueDate}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                     handleFieldChange("dueDate", e.target.value);
                                     if (!isEditing && taskId && onUpdate) {
                                       onUpdate(taskId, { dueDate: (e.target.value ? serializeCalendarDateForApi(e.target.value) : null) as any });
                                     }
                                  }}
                                  className="h-7 text-sm bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                               />
                             </div>
                           </div>
                           
                           <Separator className="my-3" />
                           
                           <div className="space-y-2">
                             <Label className="text-xs font-medium text-muted-foreground">{t.estimation}</Label>
                             <div className="flex items-center gap-2 p-2 rounded-lg bg-background border border-border hover:border-border transition-colors">
                               <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                               <Input
                                  type="number"
                                  min={0}
                                  max={9999}
                                  value={formData.estimatedMinutes}
                                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                     handleFieldChange("estimatedMinutes", e.target.value);
                                     const val = parseInt(e.target.value, 10);
                                     if (!isEditing && taskId && onUpdate && !isNaN(val) && val >= 0) {
                                       onUpdate(taskId, { estimatedMinutes: val });
                                     }
                                  }}
                                  placeholder="0"
                                  className="h-7 text-sm bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                               />
                             </div>
                           </div>
                           
                           <Separator className="my-3" />
                           
                           <div className="space-y-2">
                             <RecurrenceSelector
                               value={recurrence ?? undefined}
                               onChange={handleRecurrenceChange}
                             />
                           </div>

                           <Separator className="my-3" />
                           
                           {taskId && renderAssigneeSelector
                             ? renderAssigneeSelector(taskId, task?.assignee)
                             : null}

                           {taskId && !renderAssigneeSelector && assignableMembers.length > 1 && (
                             <AssigneeSelector
                               taskId={taskId}
                               variant="full"
                               currentAssignee={task?.assignee ?? null}
                               members={selectorMembers}
                               onAssign={(userId) =>
                                 onUpdate?.(taskId, { assigneeId: userId })
                               }
                             />
                           )}
                        </div>
                      </div>
                    </div>
                 </div>
                 
                 <Separator className="my-6" />
                 
                 {/* Tabs */}
                 <div className="space-y-4 sm:space-y-5">
                    <div className="flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 bg-muted rounded-lg w-full sm:w-fit border border-border">
                     <TabButton
                       active={activeTab === 'subtasks'}
                       onClick={() => setActiveTab('subtasks')}
                       icon={CheckSquare}
                       label={t.tabsSubtasks}
                       count={task?.subTasks?.length}
                     />
                     <TabButton
                       active={activeTab === 'comments'}
                       onClick={() => setActiveTab('comments')}
                       icon={MessageSquare}
                       label={t.tabsComments}
                       count={task?.comments?.length}
                     />
                     <TabButton
                       active={activeTab === 'attachments'}
                       onClick={() => setActiveTab('attachments')}
                       icon={Paperclip}
                       label={t.tabsAttachments}
                       count={attachments.length}
                     />
                     <TabButton
                       active={activeTab === 'activity'}
                       onClick={() => setActiveTab('activity')}
                       icon={Activity}
                       label={t.tabsActivity}
                     />
                     <TabButton
                       active={activeTab === 'dependencies'}
                       onClick={() => setActiveTab('dependencies')}
                       icon={GitBranch}
                       label={t.tabsDependencies}
                       count={dependencies.blockedBy.length + dependencies.blocking.length}
                     />
                     {task?.projectId && (
                       <TabButton
                         active={activeTab === 'customFields'}
                         onClick={() => setActiveTab('customFields')}
                         icon={SlidersHorizontal}
                         label="Custom Fields"
                       />
                     )}
                    </div>
                    
                    <div className="min-h-[200px] animate-in fade-in slide-in-from-bottom-2 duration-300">
                       {activeTab === 'subtasks' && taskId && renderSubtaskList && renderSubtaskList(taskId, task?.subTasks || [])}
                       {activeTab === 'comments' && taskId && (
                         renderComments ? renderComments(taskId) : (
                           <CommentThread
                             taskId={taskId}
                             comments={comments}
                             currentUserId={currentUser?.id}
                             users={mentionUsers}
                             onCreate={handleCreateComment}
                             onUpdate={handleUpdateComment}
                             onDelete={handleDeleteComment}
                             labels={{
                                title: t['tabsComments'], // Reuse tab label or add specific ones
                                placeholder: 'Write a comment... (use @ to mention)',
                             }}
                           />
                         )
                       )}
                       {activeTab === 'attachments' && taskId && (
                         renderAttachments ? renderAttachments(taskId) : (
                           <div className="space-y-4">
                             <div className="flex items-center gap-2">
                               <Input
                                 type="file"
                                 className="text-sm cursor-pointer"
                                 onChange={handleUploadFile}
                                 disabled={uploadAttachmentMutation.isPending}
                               />
                               {uploadAttachmentMutation.isPending && <span className="text-xs text-muted-foreground">Uploading...</span>}
                             </div>
                             <AttachmentList
                               taskId={taskId}
                               attachments={attachments}
                               onDelete={handleDeleteAttachment}
                             />
                           </div>
                         )
                       )}
                       {activeTab === 'activity' && taskId && renderActivity && renderActivity(taskId)}
                       {activeTab === 'dependencies' && taskId && (
                         <div className="space-y-6">
                           <div className="p-3.5 rounded-xl border border-border bg-card space-y-3">
                             <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                               <GitBranch className="h-4 w-4 text-violet-500" />
                               Add Blocking Dependency
                             </h4>
                             <p className="text-xs text-muted-foreground">
                               Select a task that must be completed before this task can be completed.
                             </p>
                             <div className="flex items-center gap-2">
                               <Select
                                 value={selectedBlockingId}
                                 onValueChange={setSelectedBlockingId}
                               >
                                 <SelectTrigger className="flex-1 text-xs">
                                   <SelectValue placeholder="Choose a blocking task..." />
                                 </SelectTrigger>
                                 <SelectContent>
                                   {availableProjectTasks.map((pt) => (
                                     <SelectItem key={pt.id} value={pt.id}>
                                       {pt.title} ({pt.status})
                                     </SelectItem>
                                   ))}
                                 </SelectContent>
                               </Select>
                               <Button
                                 size="sm"
                                 disabled={!selectedBlockingId}
                                 onClick={handleAddDependency}
                               >
                                 Add
                               </Button>
                             </div>
                           </div>

                           <div className="space-y-2">
                             <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                               <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                               Blocked By ({dependencies.blockedBy.length})
                             </h4>
                             {dependencies.blockedBy.length === 0 ? (
                               <p className="text-xs text-muted-foreground italic">No blocking tasks.</p>
                             ) : (
                               <div className="space-y-2">
                                 {dependencies.blockedBy.map((depTask: any) => (
                                   <div
                                     key={depTask.id}
                                     className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-muted/30"
                                   >
                                     <div>
                                       <p className="text-sm font-medium">{depTask.title}</p>
                                       <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                         {depTask.status}
                                       </span>
                                     </div>
                                     <Button
                                       size="sm"
                                       variant="ghost"
                                       onClick={() => handleRemoveDependency(depTask.id)}
                                     >
                                       <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                     </Button>
                                   </div>
                                 ))}
                                </div>
                             )}
                           </div>

                           <div className="space-y-2">
                             <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                               Blocking Other Tasks ({dependencies.blocking.length})
                             </h4>
                             {dependencies.blocking.length === 0 ? (
                               <p className="text-xs text-muted-foreground italic">This task isn't blocking any other tasks.</p>
                             ) : (
                               <div className="space-y-2">
                                 {dependencies.blocking.map((depTask: any) => (
                                   <div
                                     key={depTask.id}
                                     className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-muted/30"
                                   >
                                     <div>
                                       <p className="text-sm font-medium">{depTask.title}</p>
                                       <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                         {depTask.status}
                                       </span>
                                     </div>
                                   </div>
                                 ))}
                               </div>
                             )}
                           </div>
                         </div>
                       )}
                       {activeTab === 'customFields' && taskId && (
                         <div className="pt-2">
                           <TaskCustomFieldsEditor
                             taskId={taskId}
                             projectId={task?.projectId}
                           />
                         </div>
                       )}
                    </div>
                 </div>
               </div>
            </div>
            
            {/* Footer */}
            <div className="p-3 sm:p-5 border-t bg-muted flex justify-between items-center gap-2">
              <Button
                 variant="ghost"
                 size="sm"
                 className="text-muted-foreground hover:text-destructive hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                 onClick={handleDelete}
                 title={t.btnDelete}
              >
                 <Trash2 className="w-4 h-4 sm:mr-2" />
                 <span className="hidden sm:inline">{t.btnDelete}</span>
              </Button>
              <div className="text-xs text-muted-foreground text-right">
                 {t.footerCreated} {task?.createdAt ? new Date(task.createdAt).toLocaleDateString() : '-'}
              </div>
            </div>
          </div>
        )}
      </SheetContent>
      
      {/* External Dialogs */}
      {renderCreateTagDialog && renderCreateTagDialog(showCreateTagDialog, setShowCreateTagDialog)}
      
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>{t.shareTitle}</DialogTitle>
             <DialogDescription>{t.shareDescription}</DialogDescription>
           </DialogHeader>
           <div className="flex items-center space-x-2 mt-4">
             <div className="grid flex-1 gap-2">
               <Label htmlFor="link" className="sr-only">Link</Label>
               <div className="flex items-center gap-2 p-2 rounded-md border bg-muted">
                 <LinkIcon className="w-4 h-4 text-muted-foreground" />
                 <input
                   id="link"
                   className="flex-1 bg-transparent border-none text-sm focus:outline-none text-muted-foreground"
                   value={task?.publicToken ? `${typeof window !== 'undefined' ? window.location.origin : ''}/share/task/${task.publicToken}` : ''}
                   readOnly
                 />
               </div>
             </div>
             <Button size="sm" className="px-3" onClick={copyShareLink}>
               <span className="sr-only">Copy</span>
               <Copy className="h-4 w-4" />
             </Button>
           </div>
         </DialogContent>
      </Dialog>
      <ConfirmModal />
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
  icon: React.ElementType;
  label: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        "flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-md text-sm font-medium transition-all flex-1 sm:flex-initial min-w-0",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:bg-background hover:text-foreground"
      )}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="hidden sm:inline truncate">{label}</span>
      {count !== undefined && count > 0 && (
        <span className="bg-muted text-muted-foreground text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0">
          {count}
        </span>
      )}
    </button>
  );
}
