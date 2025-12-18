'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Button } from '../ui/button.js';
import { Input } from '../ui/input.js';
import { Label } from '../ui/label.js';
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
export function TaskForm({ projectId, isPending = false, onSubmit, labels = {}, className = '', }) {
    const [title, setTitle] = useState('');
    const { label = 'New Task', placeholder = 'Task title...', add = 'Add', adding = 'Adding...', } = labels;
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim() || !projectId)
            return;
        onSubmit?.({ title: title.trim(), projectId });
        setTitle('');
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: `flex gap-2 items-end ${className}`, children: [_jsxs("div", { className: "grid w-full max-w-sm items-center gap-1.5", children: [_jsx(Label, { htmlFor: "task-title", children: label }), _jsx(Input, { type: "text", id: "task-title", placeholder: placeholder, value: title, onChange: (e) => setTitle(e.target.value), disabled: isPending })] }), _jsx(Button, { type: "submit", disabled: isPending || !title.trim() || !projectId, children: isPending ? adding : add })] }));
}
