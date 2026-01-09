'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';
import { Label } from '@/components/ui';
import { Input } from '@/components/ui';
import { Textarea } from '@/components/ui';
import { Button } from '@/components/ui';
import { EmptyState } from '@/components/ui';
import { ScrollArea } from '@/components/ui';
import { Briefcase, Check, Palette, LayoutTemplate } from 'lucide-react';
import { PROJECT_COLORS, createProjectSchema } from '@ordo-todo/hooks';

// Interfaces for props
export interface WorkspaceOption {
  id: string;
  name: string;
}

export interface WorkflowOption {
  id: string;
  name: string;
}

export interface ProjectTemplateTask {
  title: string;
  description: string;
  priority: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType; // Lucide icon
  color: string;
  tasks: ProjectTemplateTask[];
}

export interface CreateProjectFormData {
  name: string;
  description?: string;
  color: string;
  workspaceId: string;
  workflowId?: string;
}

interface CreateProjectDialogProps {
  /** Whether dialog is open */
  open: boolean;
  /** Called when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Pre-selected workspace ID */
  workspaceId?: string;
  /** Available workspaces */
  workspaces?: WorkspaceOption[];
  /** Whether workspaces are loading */
  isLoadingWorkspaces?: boolean;
  /** Available workflows for selected workspace */
  workflows?: WorkflowOption[];
  /** Available project templates */
  templates?: ProjectTemplate[];
  /** Whether create operation is pending */
  isPending?: boolean;
  /** Called when form is submitted */
  onSubmit: (data: CreateProjectFormData, templateTasks?: ProjectTemplateTask[]) => void;
  /** Called when workflow needs to be created (if none exists) */
  onCreateWorkflow?: (workspaceId: string) => Promise<string>;
  /** Custom labels for i18n */
  labels?: {
    title?: string;
    description?: string;
    descriptionPlaceholder?: string;
    nameRequired?: string;
    workspaceRequired?: string;
    templateSelected?: (name: string) => string;
    createWorkspace?: string;
    emptyTitle?: string;
    emptyDescription?: string;
    emptyAction?: string;
    templatesTitle?: string;
    tasksCount?: (count: number) => string;
    hideTemplates?: string;
    useTemplate?: string;
    colorLabel?: string;
    nameLabel?: string;
    namePlaceholder?: string;
    workspaceLabel?: string;
    descriptionLabel?: string;
    cancel?: string;
    create?: string;
    creating?: string;
  };
}

/**
 * CreateProjectDialog - Platform-agnostic project creation dialog
 * 
 * Handles project creation with optional templates.
 * Data fetching and mutations are handled externally via props.
 */
export function CreateProjectDialog({
  open,
  onOpenChange,
  workspaceId,
  workspaces = [],
  isLoadingWorkspaces = false,
  workflows = [],
  templates = [],
  isPending = false,
  onSubmit,
  onCreateWorkflow: _onCreateWorkflow,
  labels = {},
}: CreateProjectDialogProps) {
  const {
    title = 'Create Project',
    description = 'Create a new project to start tracking your tasks.',
    descriptionPlaceholder = 'Project description (optional)',
    nameRequired = 'Project name is required',
    workspaceRequired = 'Workspace is required',
    createWorkspace: _createWorkspace = 'Please create a workspace first',
    emptyTitle = 'No Workspaces Found',
    emptyDescription = 'You need a workspace to create projects.',
    emptyAction = 'Create Workspace',
    templatesTitle = 'Start with a Template',
    tasksCount = (count: number) => `${count} Tasks`,
    hideTemplates = 'Hide Templates',
    useTemplate = 'Use Template',
    colorLabel = 'Color',
    nameLabel = 'Name',
    namePlaceholder = 'Project Name',
    workspaceLabel = 'Workspace',
    descriptionLabel = 'Description',
    cancel = 'Cancel',
    create = 'Create Project',
    creating = 'Creating...',
  } = labels;

  const [selectedColor, setSelectedColor] = useState<(typeof PROJECT_COLORS)[number]>(
    PROJECT_COLORS[3]
  );
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);

  // Schema with validation messages
  const formSchema = createProjectSchema.extend({
    name: z.string().min(1, nameRequired),
    workspaceId: z.string().min(1, workspaceRequired),
  });

  type CreateProjectForm = z.infer<typeof formSchema>;

  const {
    register,
    handleSubmit,
    reset: _reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateProjectForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workspaceId: workspaceId || '',
      color: PROJECT_COLORS[3],
      workflowId: '',
    },
  });

  const selectedWorkspaceId = watch('workspaceId');

  // Update default workflow when workflows change
  useEffect(() => {
    // If workflows are provided, try to select the first one or logic handled by parent
    // Here we mainly rely on the parent or the onSubmit handler to deal with "NEW" workflow logic if needed
    if (workflows && workflows.length > 0) {
      const firstWorkflow = workflows[0];
      if (firstWorkflow?.id) {
        setValue('workflowId', String(firstWorkflow.id));
      }
    } else {
      // Logic for "NEW" workflow should ideally be handled in onSubmit wrapper in parent
      setValue('workflowId', 'NEW'); 
    }
  }, [workflows, setValue]);

  // Set default workspace if none selected
  useEffect(() => {
    if (!workspaceId && workspaces && workspaces.length > 0 && !selectedWorkspaceId) {
      if (workspaces[0]?.id) setValue('workspaceId', String(workspaces[0].id));
    }
  }, [workspaces, workspaceId, selectedWorkspaceId, setValue]);

  // Sync workspaceId prop to form value
  useEffect(() => {
    if (workspaceId) {
      setValue('workspaceId', workspaceId);
    }
  }, [workspaceId, setValue]);

  const handleTemplateSelect = (template: ProjectTemplate) => {
    setValue('name', template.name);
    setValue('description', template.description);
    setSelectedColor(template.color as (typeof PROJECT_COLORS)[number]);
    setSelectedTemplate(template);
    setShowTemplates(false);
  };

  const handleFormSubmit = async (data: CreateProjectForm) => {
    
    // Logic for creating workflow if needed should be handled by logic passed in `onSubmit` 
    // or by expanding the `onSubmit` to separate async steps. 
    // For simplicity/agnosticism, we pass the data up. 
    // The parent component is responsible for:
    // 1. Checking if workflowId is valid or needs creation
    // 2. Calling createProject
    // 3. Creating tasks from template if provided

    onSubmit(
      { ...data, color: selectedColor }, 
      selectedTemplate?.tasks
    );
    
    // We don't reset here immediately, usually parent handles success/close
  };

  const showEmptyState = !workspaceId && !isLoadingWorkspaces && workspaces.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] gap-0 p-0 overflow-hidden bg-background border-border">
        <div className="p-6 space-y-6">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold text-foreground">
                {title}
              </DialogTitle>
              <button
                type="button"
                onClick={() => setShowTemplates(!showTemplates)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-full hover:bg-primary/20 transition-colors duration-200"
              >
                <LayoutTemplate className="w-3.5 h-3.5" />
                {showTemplates ? hideTemplates: useTemplate}
              </button>
            </div>
            <DialogDescription className="text-muted-foreground">
              {description}
            </DialogDescription>
          </DialogHeader>

          {showEmptyState ? (
            <EmptyState
              icon={Briefcase}
              title={emptyTitle}
              description={emptyDescription}
              actionLabel={emptyAction}
              onAction={() => {
                onOpenChange(false);
              }}
            />
          ) : (
            <>
              {showTemplates && templates.length > 0 && (
                <div className="bg-muted/30 rounded-lg border border-border p-4 mb-4">
                  <h4 className="text-sm font-medium mb-3">{templatesTitle}</h4>
                  <ScrollArea className="h-[200px] pr-4">
                    <div className="grid grid-cols-2 gap-3">
                      {templates.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => handleTemplateSelect(template)}
                          className="flex flex-col items-start gap-2 p-3 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                        >
                          <div className="flex items-center gap-2 w-full">
                            <div
                              className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                              style={{
                                backgroundColor: `${template.color}20`,
                                color: template.color,
                              }}
                            >
                              <template.icon className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-sm truncate">
                              {template.name}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {template.description}
                          </p>
                          <div className="text-xs text-primary/70 font-medium">
                            {tasksCount(template.tasks.length)}
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                {/* Color Picker */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Palette className="w-4 h-4" /> {colorLabel}
                  </Label>
                  <div className="flex gap-3 flex-wrap p-3 rounded-lg border border-border bg-muted/20">
                    {PROJECT_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`relative h-8 w-8 rounded-full transition-transform hover:scale-110 ${
                          selectedColor === color
                            ? 'ring-2 ring-offset-2 ring-offset-background ring-primary scale-110'
                            : 'hover:opacity-80'
                        }`}
                        style={{ backgroundColor: color }}
                      >
                        {selectedColor === color && (
                          <Check className="w-4 h-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-foreground">
                    {nameLabel}
                  </Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder={namePlaceholder}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                {/* Workspace Selection (if not provided) */}
                {!workspaceId && workspaces.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="workspaceId" className="text-sm font-medium text-foreground">
                      {workspaceLabel}
                    </Label>
                    <select
                      id="workspaceId"
                      {...register('workspaceId')}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {workspaces.map((ws) => (
                        <option key={ws.id} value={ws.id}>
                          {ws.name}
                        </option>
                      ))}
                    </select>
                    {errors.workspaceId && (
                      <p className="text-sm text-destructive">{errors.workspaceId.message}</p>
                    )}
                  </div>
                )}

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-foreground">
                    {descriptionLabel}
                  </Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder={descriptionPlaceholder}
                    className="min-h-[100px] resize-none"
                  />
                </div>

                {/* Hidden workspace ID if provided */}
                {workspaceId && <input type="hidden" {...register('workspaceId')} />}

                <DialogFooter className="pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onOpenChange(false)}
                  >
                    {cancel}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending}
                  >
                    {isPending ? creating : create}
                  </Button>
                </DialogFooter>
              </form>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
