import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Plus, X, Calendar, Clock, Tag, ChevronDown, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { cn, Button, Input, Textarea, Popover, PopoverContent, PopoverTrigger, Badge } from '@ordo-todo/ui';
import { useTasks, useCreateTask, useProjects, useTags, useAssignTagToTask } from '@/lib/shared-hooks';
import { useParseTask } from '@/hooks/use-parse-task';
import { serializeCalendarDateForApi, toCalendarDateString } from '@ordo-todo/core';

interface QuickAddTaskProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickAddTask({ isOpen, onClose }: QuickAddTaskProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [projectId, setProjectId] = useState('');
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const { data: projects } = useProjects("");
  const { data: tags } = useTags("");
  const createTask = useCreateTask();
  const assignTag = useAssignTagToTask();
  const { t } = useTranslation();

  // Live NL parse of the title input (S5): prefills date/priority/
  // project; empty fields only, manual edits always win.
  const { parsed: nlParsed, isParsing: nlParsing } = useParseTask(title);

  useEffect(() => {
    if (!nlParsed) return;
    if (nlParsed.dueAt && !dueDate) {
      setDueDate(toCalendarDateString(nlParsed.dueAt));
    }
    if (nlParsed.priority && nlParsed.priority !== 'MEDIUM') {
      setPriority((current) =>
        current === 'medium' ? (nlParsed.priority as string).toLowerCase() as 'low' | 'medium' | 'high' : current,
      );
    }
    if (nlParsed.projectHint && !projectId && projects) {
      const hint = nlParsed.projectHint.toLowerCase();
      const match = projects.find(
        (project) =>
          project.name.toLowerCase().includes(hint) ||
          project.slug.toLowerCase() === hint,
      );
      if (match) setProjectId(match.id);
    }
    // Intentionally not depending on dueDate/projectId: prefill once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nlParsed, projects]);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset form when closed
  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setDescription('');
      setDueDate('');
      setProjectId('');
      setTagIds([]);
      setPriority('medium');
    }
  }, [isOpen]);

  // Handle global event
  useEffect(() => {
    const handleOpenQuickAdd = () => {
      // This would be handled by the parent component
    };

    window.addEventListener('openQuickAdd', handleOpenQuickAdd);
    return () => window.removeEventListener('openQuickAdd', handleOpenQuickAdd);
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await createTask.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate ? (serializeCalendarDateForApi(dueDate) as any) : undefined,
        // ODD 021: sin proyecto seleccionado → tarea express
        projectId: projectId || undefined,
        // ODD 025 S9: el DTO de creación no acepta tagIds
        // (forbidNonWhitelisted → 400): se asignan tras crear.
        priority: priority.toUpperCase() as any,
        status: 'TODO',
      } as any);

      if (tagIds.length > 0 && created?.id) {
        for (const tagId of tagIds) {
          try {
            await assignTag.mutateAsync({ taskId: created.id, tagId });
          } catch {
            // una etiqueta que falle no invalida la tarea creada
          }
        }
      }

      toast.success('Task created successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to create task');
      console.error('Quick add task error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && e.metaKey) {
      handleSubmit(e as any);
    }
  };

  const selectedProject = projects?.find(p => p.id === projectId);
  const selectedTags = tags?.filter(t => tagIds.includes(t.id));

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Quick Add Dialog */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 w-[500px] z-50">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold">Quick Add Task</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4" onKeyDown={handleKeyDown}>
          {/* Title Input */}
          <div>
            <Input
              ref={inputRef}
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-base border-0 shadow-none focus-visible:ring-0 px-0 text-lg font-medium placeholder:text-gray-500"
              autoFocus
            />
          </div>

          {/* NL parse preview */}
          {(nlParsing || (nlParsed && title.trim())) && (
            <div className="flex flex-wrap items-center gap-2">
              {nlParsing && (
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              )}
              {!nlParsing && nlParsed?.dueAt && (
                <Badge variant="secondary">
                  {new Date(nlParsed.dueAt).toLocaleDateString()}
                </Badge>
              )}
              {!nlParsing && nlParsed?.priority && nlParsed.priority !== 'MEDIUM' && (
                <Badge variant="secondary">{nlParsed.priority}</Badge>
              )}
              {!nlParsing && nlParsed?.projectHint && (
                <Badge variant="secondary">#{nlParsed.projectHint}</Badge>
              )}
              {!nlParsing && nlParsed?.recurrence && (
                <Badge variant="secondary">{nlParsed.recurrence}</Badge>
              )}
              {!nlParsing && nlParsed?.needsConfirmation && (
                <span className="flex items-center gap-1 text-xs text-amber-600">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {t('QuickAdd.confirmHint', 'Review before creating')}
                </span>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <Textarea
              placeholder="Add a description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px] resize-none"
              rows={3}
            />
          </div>

          {/* Meta Options */}
          <div className="flex flex-wrap gap-2">
            {/* Due Date */}
            <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Calendar className="h-3.5 w-3.5 text-gray-500" />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-transparent text-sm outline-none"
              />
            </div>

            {/* Project */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-sm">
                    {selectedProject?.name || 'No Project'}
                  </span>
                  <ChevronDown className="h-3 w-3" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-1">
                <div className="py-1">
                  <button
                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    onClick={() => setProjectId('')}
                  >
                    No Project
                  </button>
                  {projects?.map((project) => (
                    <button
                      key={project.id}
                      className={cn(
                        'w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2',
                        projectId === project.id && 'bg-gray-100 dark:bg-gray-700'
                      )}
                      onClick={() => setProjectId(project.id)}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      {project.name}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Tags */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <Tag className="h-3.5 w-3.5 text-gray-500" />
                  <span className="text-sm">
                    {selectedTags?.length ? `${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''}` : 'Add Tags'}
                  </span>
                  <ChevronDown className="h-3 w-3" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-1">
                <div className="py-1">
                  {tags?.map((tag) => (
                    <button
                      key={tag.id}
                      className={cn(
                        'w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2',
                        tagIds.includes(tag.id) && 'bg-gray-100 dark:bg-gray-700'
                      )}
                      onClick={() => {
                        setTagIds(prev =>
                          prev.includes(tag.id)
                            ? prev.filter(id => id !== tag.id)
                            : [...prev, tag.id]
                        );
                      }}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      {tag.name}
                      {tagIds.includes(tag.id) && <span className="ml-auto">✓</span>}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Priority */}
            <Popover>
              <PopoverTrigger asChild>
                <button className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors',
                  priority === 'high' && 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
                  priority === 'medium' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
                  priority === 'low' && 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                )}>
                  <Clock className="h-3.5 w-3.5" />
                  <span className="text-sm capitalize">{priority} Priority</span>
                  <ChevronDown className="h-3 w-3" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-36 p-1">
                <div className="py-1">
                  {(['low', 'medium', 'high'] as const).map((p) => (
                    <button
                      key={p}
                      className={cn(
                        'w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded capitalize',
                        priority === p && 'bg-gray-100 dark:bg-gray-700'
                      )}
                      onClick={() => setPriority(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-gray-500">
              Press <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">Cmd+Enter</kbd> to save
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!title.trim() || isSubmitting}
                className="min-w-[80px]"
              >
                {isSubmitting ? 'Creating...' : 'Add Task'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}