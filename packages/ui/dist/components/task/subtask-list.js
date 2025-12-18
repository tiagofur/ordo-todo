'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Plus, GripVertical, Check, X, Trash2, ArrowRight, Pencil } from 'lucide-react';
import { cn } from '../../utils/index.js';
import { Button } from '../ui/button.js';
import { Input } from '../ui/input.js';
import { Checkbox } from '../ui/checkbox.js';
/**
 * SubtaskList - Platform-agnostic subtask management component
 *
 * All CRUD operations handled via props.
 *
 * @example
 * const createSubtask = useCreateSubtask();
 * const completeTask = useCompleteTask();
 *
 * <SubtaskList
 *   subtasks={task.subtasks || []}
 *   isCreating={createSubtask.isPending}
 *   onCreate={(title) => createSubtask.mutate({ parentTaskId, data: { title } })}
 *   onToggleComplete={(id, status) => {
 *     if (status === 'COMPLETED') updateTask.mutate({ taskId: id, data: { status: 'TODO' } });
 *     else completeTask.mutate(id);
 *   }}
 *   onDelete={(id) => deleteTask.mutate(id)}
 *   onUpdate={(id, title) => updateTask.mutate({ taskId: id, data: { title } })}
 *   labels={{ title: t('title'), add: t('add') }}
 * />
 */
export function SubtaskList({ subtasks = [], isCreating = false, isUpdating = false, onCreate, onToggleComplete, onDelete, onUpdate, labels = {}, className = '', }) {
    const [isAdding, setIsAdding] = useState(false);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editingTitle, setEditingTitle] = useState('');
    const { title = 'Subtasks', add = 'Add Subtask', placeholder = 'Subtask title...', empty = 'No subtasks yet', nested = 'Contains nested subtasks', confirmDelete = 'Are you sure you want to delete this subtask?', tooltipDrag = 'Drag to reorder', tooltipEdit = 'Edit', tooltipDelete = 'Delete', } = labels;
    const handleCreateSubtask = () => {
        if (!newSubtaskTitle.trim())
            return;
        onCreate?.(newSubtaskTitle.trim());
        setNewSubtaskTitle('');
        setIsAdding(false);
    };
    const handleToggleComplete = (subtaskId, currentStatus) => {
        onToggleComplete?.(subtaskId, currentStatus);
    };
    const handleDelete = (subtaskId) => {
        if (confirm(confirmDelete)) {
            onDelete?.(subtaskId);
        }
    };
    const handleStartEdit = (subtaskId, currentTitle) => {
        setEditingId(subtaskId);
        setEditingTitle(currentTitle);
    };
    const handleSaveEdit = (subtaskId) => {
        if (!editingTitle.trim()) {
            handleCancelEdit();
            return;
        }
        onUpdate?.(subtaskId, editingTitle.trim());
        setEditingId(null);
        setEditingTitle('');
    };
    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingTitle('');
    };
    const completedCount = subtasks.filter((st) => st.status === 'COMPLETED').length;
    const totalCount = subtasks.length;
    const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    return (_jsxs("div", { className: cn('space-y-3', className), children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h3", { className: "text-sm font-semibold", children: title }), totalCount > 0 && (_jsxs("span", { className: "text-xs text-muted-foreground", children: [completedCount, "/", totalCount] }))] }), totalCount > 0 && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-24 h-2 bg-muted rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-primary transition-all duration-300", style: { width: `${progressPercentage}%` } }) }), _jsxs("span", { className: "text-xs text-muted-foreground", children: [Math.round(progressPercentage), "%"] })] }))] }), _jsxs("div", { className: "space-y-2", children: [subtasks.map((subtask) => (_jsxs("div", { className: cn('group flex items-start gap-2 rounded-lg border p-3 transition-all', 'hover:bg-accent/50', subtask.status === 'COMPLETED' && 'opacity-60'), children: [_jsx("button", { className: "opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing mt-0.5", title: tooltipDrag, children: _jsx(GripVertical, { className: "h-4 w-4 text-muted-foreground" }) }), _jsx(Checkbox, { checked: subtask.status === 'COMPLETED', onCheckedChange: () => handleToggleComplete(String(subtask.id), subtask.status), className: "mt-0.5" }), _jsx("div", { className: "flex-1 min-w-0", children: editingId === String(subtask.id) ? (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Input, { value: editingTitle, onChange: (e) => setEditingTitle(e.target.value), className: "h-7 text-sm", autoFocus: true, onKeyDown: (e) => {
                                                if (e.key === 'Enter') {
                                                    handleSaveEdit(String(subtask.id));
                                                }
                                                else if (e.key === 'Escape') {
                                                    handleCancelEdit();
                                                }
                                            } }), _jsx(Button, { size: "icon", variant: "ghost", className: "h-6 w-6", onClick: () => handleSaveEdit(String(subtask.id)), disabled: isUpdating, children: _jsx(Check, { className: "h-3 w-3 text-green-600" }) }), _jsx(Button, { size: "icon", variant: "ghost", className: "h-6 w-6", onClick: handleCancelEdit, children: _jsx(X, { className: "h-3 w-3 text-muted-foreground" }) })] })) : (_jsx("p", { className: cn('text-sm cursor-text', subtask.status === 'COMPLETED' && 'line-through text-muted-foreground'), onDoubleClick: () => handleStartEdit(String(subtask.id), subtask.title), children: subtask.title })) }), editingId !== String(subtask.id) && (_jsxs("div", { className: "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity", children: [_jsx(Button, { variant: "ghost", size: "icon", className: "h-6 w-6", onClick: () => handleStartEdit(String(subtask.id), subtask.title), title: tooltipEdit, children: _jsx(Pencil, { className: "h-3 w-3" }) }), _jsx(Button, { variant: "ghost", size: "icon", className: "h-6 w-6", onClick: () => handleDelete(String(subtask.id)), title: tooltipDelete, children: _jsx(Trash2, { className: "h-3 w-3" }) })] }))] }, subtask.id))), subtasks.length === 0 && !isAdding && (_jsx("div", { className: "text-center py-6 text-sm text-muted-foreground", children: empty }))] }), isAdding ? (_jsxs("div", { className: "flex items-center gap-2 rounded-lg border p-3 bg-accent/20", children: [_jsx(Input, { value: newSubtaskTitle, onChange: (e) => setNewSubtaskTitle(e.target.value), placeholder: placeholder, className: "flex-1", autoFocus: true, onKeyDown: (e) => {
                            if (e.key === 'Enter') {
                                handleCreateSubtask();
                            }
                            else if (e.key === 'Escape') {
                                setIsAdding(false);
                                setNewSubtaskTitle('');
                            }
                        } }), _jsx(Button, { size: "sm", onClick: handleCreateSubtask, disabled: !newSubtaskTitle.trim() || isCreating, children: _jsx(Check, { className: "h-4 w-4" }) }), _jsx(Button, { size: "sm", variant: "ghost", onClick: () => {
                            setIsAdding(false);
                            setNewSubtaskTitle('');
                        }, children: _jsx(X, { className: "h-4 w-4" }) })] })) : (_jsxs(Button, { variant: "outline", size: "sm", onClick: () => setIsAdding(true), className: "w-full", children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), add] })), subtasks.some((st) => st.parentTaskId) && (_jsxs("div", { className: "text-xs text-muted-foreground flex items-center gap-1", children: [_jsx(ArrowRight, { className: "h-3 w-3" }), nested] }))] }));
}
