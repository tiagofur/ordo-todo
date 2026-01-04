'use client';

import { useState, useEffect, type ReactNode } from 'react';
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
  Plus
} from 'lucide-react';
import {
  cn,
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
  Skeleton,
} from '@ordo-todo/ui';

// Types
export interface TaskTag {
  id: string;
  name: string;
  color: string;
}

export interface TaskDetailData {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDate?: string | Date | null;
  estimatedTime?: number | null;
  createdAt?: string | Date;
  tags?: TaskTag[];
  assignee?: Record<string, unknown>;
  publicToken?: string | null;
  subTasks?: Record<string, unknown>[];
  comments?: Record<string, unknown>[];
  attachments?: Record<string, unknown>[];
  activities?: Record<string, unknown>[];
}

interface TaskDetailPanelProps {
  taskId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Task Data and State */
  task?: TaskDetailData;
  isLoading?: boolean;
  /** Current User Info */
  currentUserId?: string;
  /** Available Tags for assignment */
  availableTags?: TaskTag[];
  /** Actions */
  onUpdate?: (taskId: string, data: Record<string, unknown>) => Promise<void> | void;
  onDelete?: (taskId: string) => Promise<void> | void;
  onAssignTag?: (taskId: string, tagId: string) => Promise<void> | void;
  onRemoveTag?: (taskId: string, tagId: string) => Promise<void> | void;
  onShare?: (taskId: string) => Promise<void> | void;
  /** Render Props for Sub-components to avoid huge dependency tree */
  renderSubtaskList?: (taskId: string, subtasks: Record<string, unknown>[]) => ReactNode;
  renderComments?: (taskId: string) => ReactNode;
  renderAttachments?: (taskId: string) => ReactNode;
  renderActivity?: (taskId: string) => ReactNode;
  renderAssigneeSelector?: (taskId: string, currentAssignee: Record<string, unknown> | undefined) => ReactNode;
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
  const [activeTab, setActiveTab] = useState<'subtasks' | 'comments' | 'attachments' | 'activity'>('subtasks');
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
    estimatedTime: '',
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'TODO',
        priority: task.priority || 'MEDIUM',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] ?? '' : '',
        estimatedTime: task.estimatedTime?.toString() || '',
      });
    }
  }, [task]);

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
     if (!taskId || !onUpdate) return;
     setIsUpdating(true);
     try {
       await onUpdate(taskId, {
         title: formData.title,
         description: formData.description,
         status: formData.status,
         priority: formData.priority,
         dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
         estimatedTime: formData.estimatedTime ? parseInt(String(formData.estimatedTime)) : undefined,
       });
       setIsEditing(false);
     } catch (err) {
       console.error(err);
     } finally {
       setIsUpdating(false);
     }
  };

  const handleDelete = async () => {
    if (!taskId || !onDelete) return;
    if (window.confirm(t.confirmDelete)) {
      await onDelete(taskId);
      onOpenChange(false);
    }
  };

  const handleShare = async () => {
    if (!taskId) return;
    if (task?.publicToken) {
      setShowShareDialog(true);
    } else if (onShare) {
      await onShare(taskId);
      setShowShareDialog(true);
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
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b bg-muted/10">
              {/* Mobile-first: Close button always visible at top right */}
              <div className="flex items-center justify-between gap-2 mb-3 sm:mb-0 sm:absolute sm:right-4 sm:top-4 sm:z-10">
                <div className="flex items-center gap-1 sm:hidden">
                  {/* Mobile: Status & Priority inline with close */}
                  <Select
                    value={formData.status}
                    onValueChange={(val) => {
                       handleFieldChange('status', val);
                       if(onUpdate && taskId) onUpdate(taskId, { status: val });
                    }}
                  >
                    <SelectTrigger className="h-7 text-xs w-auto gap-1 border-transparent bg-secondary/50 hover:bg-secondary/80 focus:ring-0">
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
                    onValueChange={(val) => {
                      handleFieldChange('priority', val);
                      if(onUpdate && taskId) onUpdate(taskId, { priority: val });
                    }}
                  >
                    <SelectTrigger className="h-7 text-xs w-auto gap-1 border-transparent bg-secondary/50 hover:bg-secondary/80 focus:ring-0">
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
                      onValueChange={(val) => {
                         handleFieldChange('status', val);
                         if(onUpdate && taskId) onUpdate(taskId, { status: val });
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs w-auto gap-2 border-transparent bg-secondary/50 hover:bg-secondary/80 focus:ring-0">
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
                      onValueChange={(val) => {
                        handleFieldChange('priority', val);
                        if(onUpdate && taskId) onUpdate(taskId, { priority: val });
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs w-auto gap-2 border-transparent bg-secondary/50 hover:bg-secondary/80 focus:ring-0">
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
                      onChange={(e) => handleFieldChange("title", e.target.value)}
                      className="text-xl sm:text-2xl font-bold h-auto py-1.5 sm:py-2 px-2 sm:px-3 -ml-2 sm:-ml-3 bg-transparent border-transparent hover:bg-accent/50 focus:bg-background focus:border-input transition-colors"
                      placeholder={t.titlePlaceholder}
                      autoFocus
                    />
                  ) : (
                    <h2
                      className="text-xl sm:text-2xl font-bold cursor-text hover:bg-accent/20 rounded px-2 -ml-2 py-1 transition-colors break-words"
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
                            className="hover:bg-background/30 rounded-full p-0.5 transition-colors"
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
                               ? "border-border/50 bg-muted/20 hover:border-border hover:bg-muted/30"
                               : "border-border/30 bg-muted/10 hover:border-border/50 hover:bg-muted/20",
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
                      <div className="space-y-4 p-4 sm:p-5 rounded-xl bg-gradient-to-br from-muted/40 to-muted/20 border-2 border-border/50 shadow-sm">
                        <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                           <div className="w-1 h-4 bg-primary rounded-full flex-shrink-0" />
                           {t.detailsTitle}
                        </h3>
                        
                        <div className="space-y-4">
                           <div className="space-y-2">
                             <Label className="text-xs font-medium text-muted-foreground">{t.dueDate}</Label>
                             <div className="flex items-center gap-2 p-2 rounded-lg bg-background/60 border border-border/50 hover:border-border transition-colors">
                               <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                               <Input
                                  type="date"
                                  value={formData.dueDate}
                                  onChange={(e) => {
                                     handleFieldChange("dueDate", e.target.value);
                                     if (!isEditing && taskId && onUpdate) {
                                       onUpdate(taskId, { dueDate: e.target.value ? new Date(e.target.value) : undefined });
                                     }
                                  }}
                                  className="h-7 text-sm bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                               />
                             </div>
                           </div>
                           
                           <Separator className="my-3" />
                           
                           <div className="space-y-2">
                             <Label className="text-xs font-medium text-muted-foreground">{t.estimation}</Label>
                             <div className="flex items-center gap-2 p-2 rounded-lg bg-background/60 border border-border/50 hover:border-border transition-colors">
                               <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                               <Input
                                  type="number"
                                  value={formData.estimatedTime}
                                  onChange={(e) => {
                                     handleFieldChange("estimatedTime", e.target.value);
                                     if (!isEditing && taskId && onUpdate && e.target.value) {
                                       onUpdate(taskId, { estimatedTime: parseFloat(e.target.value) });
                                     }
                                  }}
                                  placeholder="0"
                                  className="h-7 text-sm bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                               />
                             </div>
                           </div>
                           
                           <Separator className="my-3" />
                           
                           {renderAssigneeSelector && taskId && renderAssigneeSelector(taskId, task?.assignee)}
                        </div>
                      </div>
                    </div>
                 </div>
                 
                 <Separator className="my-6" />
                 
                 {/* Tabs */}
                 <div className="space-y-4 sm:space-y-5">
                    <div className="flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 bg-muted/40 rounded-lg w-full sm:w-fit border border-border/30">
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
                       count={task?.attachments?.length}
                     />
                     <TabButton
                       active={activeTab === 'activity'}
                       onClick={() => setActiveTab('activity')}
                       icon={Activity}
                       label={t.tabsActivity}
                     />
                    </div>
                    
                    <div className="min-h-[200px] animate-in fade-in slide-in-from-bottom-2 duration-300">
                       {activeTab === 'subtasks' && taskId && renderSubtaskList && renderSubtaskList(taskId, task?.subTasks || [])}
                       {activeTab === 'comments' && taskId && renderComments && renderComments(taskId)}
                       {activeTab === 'attachments' && taskId && renderAttachments && renderAttachments(taskId)}
                       {activeTab === 'activity' && taskId && renderActivity && renderActivity(taskId)}
                    </div>
                 </div>
               </div>
            </div>
            
            {/* Footer */}
            <div className="p-3 sm:p-5 border-t bg-muted/10 flex justify-between items-center gap-2">
              <Button
                 variant="ghost"
                 size="sm"
                 className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
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
               <div className="flex items-center gap-2 p-2 rounded-md border bg-muted/50">
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
          : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
      )}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="hidden sm:inline truncate">{label}</span>
      {count !== undefined && count > 0 && (
        <span className="bg-muted-foreground/10 text-muted-foreground text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0">
          {count}
        </span>
      )}
    </button>
  );
}
