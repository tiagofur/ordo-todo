'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Label } from '@/components/ui';

interface TaskFormProps {
  /** Project ID to create task in */
  projectId?: string;
  /** Whether task creation is pending */
  isPending?: boolean;
  /** Called when form is submitted */
  onSubmit?: (data: { title: string; projectId: string }) => void;
  /** Custom labels for i18n */
  labels?: {
    label?: string;
    placeholder?: string;
    add?: string;
    adding?: string;
  };
  className?: string;
}

/**
 * TaskForm - Simple inline task creation form
 * 
 * @example
 * const createTask = useCreateTask();
 * 
 * <TaskForm
 *   projectId={projectId}
 *   isPending={createTask.isPending}
 *   onSubmit={(data) => {
 *     createTask.mutate(data, {
 *       onSuccess: () => notify.success('Created!'),
 *       onError: (e) => notify.error(e.message),
 *     });
 *   }}
 *   labels={{ label: t('label'), placeholder: t('placeholder') }}
 * />
 */
export function TaskForm({
  projectId,
  isPending = false,
  onSubmit,
  labels = {},
  className = '',
}: TaskFormProps) {
  const [title, setTitle] = useState('');

  const {
    label = 'New Task',
    placeholder = 'Task title...',
    add = 'Add',
    adding = 'Adding...',
  } = labels;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !projectId) return;
    onSubmit?.({ title: title.trim(), projectId });
    setTitle('');
  };

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 items-end ${className}`}>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="task-title">{label}</Label>
        <Input
          type="text"
          id="task-title"
          placeholder={placeholder}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isPending}
        />
      </div>
      <Button type="submit" disabled={isPending || !title.trim() || !projectId}>
        {isPending ? adding : add}
      </Button>
    </form>
  );
}
