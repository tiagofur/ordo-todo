'use client';
import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { Send, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '../ui/button.js';
import { Textarea } from '../ui/textarea.js';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar.js';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from '../ui/dropdown-menu.js';
import { formatDistanceToNow } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import { MentionTextarea } from '../ui/mention-textarea.js';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
const DEFAULT_LABELS = {
    title: 'Comments',
    edited: '(edited)',
    placeholder: 'Write a comment...',
    shortcut: 'Press Ctrl+Enter to send',
    empty: 'No comments yet',
    confirmDelete: 'Are you sure you want to delete this comment?',
    actions: {
        edit: 'Edit',
        delete: 'Delete',
        save: 'Save',
        saving: 'Saving...',
        cancel: 'Cancel',
        send: 'Send',
        sending: 'Sending...',
    },
};
export function CommentThread({ taskId, comments = [], currentUserId, users = [], onCreate, onUpdate, onDelete, locale = 'en', labels = {}, }) {
    const t = {
        ...DEFAULT_LABELS,
        ...labels,
        actions: { ...DEFAULT_LABELS.actions, ...labels.actions },
    };
    const [newComment, setNewComment] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Helper to wrap promise with loading state
    const handleAction = async (action) => {
        setIsSubmitting(true);
        try {
            await action();
        }
        catch (e) {
            console.error(e);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleCreateComment = () => {
        if (!newComment.trim() || !onCreate)
            return;
        handleAction(async () => {
            await onCreate(newComment);
            setNewComment('');
        });
    };
    const handleUpdateComment = (commentId) => {
        if (!editContent.trim() || !onUpdate)
            return;
        handleAction(async () => {
            await onUpdate(String(commentId), editContent);
            setEditingId(null);
            setEditContent('');
        });
    };
    const handleDeleteComment = (commentId) => {
        if (!onDelete)
            return;
        if (window.confirm(t.confirmDelete)) {
            // Don't set global submitting for delete, maybe? or yes.
            // onDelete is usually fast.
            try {
                onDelete(String(commentId));
            }
            catch (e) {
                console.error(e);
            }
        }
    };
    const handleStartEdit = (comment) => {
        setEditingId(comment.id);
        setEditContent(comment.content);
    };
    const handleCancelEdit = () => {
        setEditingId(null);
        setEditContent('');
    };
    const getInitials = (name) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };
    const formatTimestamp = (date) => {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        const dateLocale = locale === 'es' ? es : enUS;
        return formatDistanceToNow(dateObj, { addSuffix: true, locale: dateLocale });
    };
    return (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsxs("h3", { className: "text-sm font-semibold", children: [t.title, " ", comments.length > 0 && `(${comments.length})`] }) }), _jsxs("div", { className: "space-y-4", children: [comments.map((comment) => {
                        const isEditing = editingId === comment.id;
                        const isOwner = currentUserId && comment.author.id === currentUserId;
                        return (_jsxs("div", { className: "flex gap-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors", children: [_jsxs(Avatar, { className: "h-8 w-8 shrink-0", children: [_jsx(AvatarImage, { src: comment.author.image, alt: comment.author.name }), _jsx(AvatarFallback, { className: "text-xs", children: getInitials(comment.author.name) })] }), _jsxs("div", { className: "flex-1 min-w-0 space-y-2", children: [_jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium truncate", children: comment.author.name }), _jsxs("p", { className: "text-xs text-muted-foreground", children: [formatTimestamp(comment.createdAt), comment.updatedAt && comment.updatedAt !== comment.createdAt && (_jsx("span", { className: "ml-1", children: t.edited }))] })] }), isOwner && !isEditing && (_jsxs(DropdownMenu, { children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx(Button, { variant: "ghost", size: "icon", className: "h-6 w-6 shrink-0", children: _jsx(MoreVertical, { className: "h-3 w-3" }) }) }), _jsxs(DropdownMenuContent, { align: "end", children: [_jsxs(DropdownMenuItem, { onClick: () => handleStartEdit(comment), children: [_jsx(Edit2, { className: "mr-2 h-3 w-3" }), t.actions.edit] }), _jsxs(DropdownMenuItem, { onClick: () => handleDeleteComment(comment.id), className: "text-destructive", children: [_jsx(Trash2, { className: "mr-2 h-3 w-3" }), t.actions.delete] })] })] }))] }), isEditing ? (_jsxs("div", { className: "space-y-2", children: [_jsx(Textarea, { value: editContent, onChange: (e) => setEditContent(e.target.value), className: "min-h-[80px] resize-none", autoFocus: true }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { size: "sm", onClick: () => handleUpdateComment(comment.id), disabled: !editContent.trim() || isSubmitting, children: isSubmitting ? t.actions.saving : t.actions.save }), _jsx(Button, { size: "sm", variant: "outline", onClick: handleCancelEdit, children: t.actions.cancel })] })] })) : (_jsx("div", { className: "text-sm prose prose-sm dark:prose-invert max-w-none break-words [&>p]:mb-0 [&>p]:mt-0", children: _jsx(ReactMarkdown, { remarkPlugins: [remarkGfm], children: comment.content }) }))] })] }, comment.id));
                    }), comments.length === 0 && (_jsx("div", { className: "text-center py-8 text-sm text-muted-foreground border border-dashed rounded-lg", children: t.empty }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(MentionTextarea, { value: newComment, onChange: (e) => setNewComment(e.target.value), placeholder: t.placeholder, className: "min-h-[100px] resize-none", users: users, onKeyDown: (e) => {
                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                handleCreateComment();
                            }
                        } }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-xs text-muted-foreground", children: t.shortcut }), _jsxs(Button, { onClick: handleCreateComment, disabled: !newComment.trim() || isSubmitting, size: "sm", children: [_jsx(Send, { className: "mr-2 h-4 w-4" }), isSubmitting ? t.actions.sending : t.actions.send] })] })] })] }));
}
