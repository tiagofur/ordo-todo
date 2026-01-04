'use client';

import { useState } from 'react';
import { Send, Edit2, Trash2, MoreVertical } from 'lucide-react';
import {
  Button,
  Textarea,
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  MentionTextarea,
} from '@ordo-todo/ui';
import { formatDistanceToNow } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Comment {
  id: string | number;
  content: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
  author: {
    id: string;
    name: string;
    email?: string;
    image?: string;
  };
}

interface MentionUser {
  id: string;
  name: string;
  image?: string;
}

interface CommentThreadProps {
  taskId: string;
  comments?: Comment[];
  currentUserId?: string;
  users?: MentionUser[];
  onCreate?: (content: string) => Promise<void> | void;
  onUpdate?: (commentId: string, content: string) => Promise<void> | void;
  onDelete?: (commentId: string) => Promise<void> | void;
  locale?: string;
  labels?: {
    title?: string;
    edited?: string;
    placeholder?: string;
    shortcut?: string;
    empty?: string;
    confirmDelete?: string;
    actions?: {
      edit?: string;
      delete?: string;
      save?: string;
      saving?: string;
      cancel?: string;
      send?: string;
      sending?: string;
    };
  };
}

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

export function CommentThread({
  taskId: _taskId,
  comments = [],
  currentUserId,
  users = [],
  onCreate,
  onUpdate,
  onDelete,
  locale = 'en',
  labels = {},
}: CommentThreadProps) {
  const t = {
    ...DEFAULT_LABELS,
    ...labels,
    actions: { ...DEFAULT_LABELS.actions, ...labels.actions },
  };

  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to wrap promise with loading state
  const handleAction = async (action: () => Promise<void> | void) => {
    setIsSubmitting(true);
    try {
      await action();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateComment = () => {
    if (!newComment.trim() || !onCreate) return;
    handleAction(async () => {
      await onCreate(newComment);
      setNewComment('');
    });
  };

  const handleUpdateComment = (commentId: string | number) => {
    if (!editContent.trim() || !onUpdate) return;
    handleAction(async () => {
      await onUpdate(String(commentId), editContent);
      setEditingId(null);
      setEditContent('');
    });
  };

  const handleDeleteComment = (commentId: string | number) => {
    if (!onDelete) return;
    if (window.confirm(t.confirmDelete)) {
      // Don't set global submitting for delete, maybe? or yes.
      // onDelete is usually fast.
      try {
         onDelete(String(commentId));
      } catch(e) { console.error(e); }
    }
  };

  const handleStartEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTimestamp = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const dateLocale = locale === 'es' ? es : enUS;
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: dateLocale });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          {t.title} {comments.length > 0 && `(${comments.length})`}
        </h3>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => {
          const isEditing = editingId === comment.id;
          const isOwner = currentUserId && comment.author.id === currentUserId;

          return (
            <div
              key={comment.id}
              className="flex gap-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors"
            >
              {/* Avatar */}
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={comment.author.image} alt={comment.author.name} />
                <AvatarFallback className="text-xs">
                  {getInitials(comment.author.name)}
                </AvatarFallback>
              </Avatar>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-2">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{comment.author.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimestamp(comment.createdAt)}
                      {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                        <span className="ml-1">{t.edited}</span>
                      )}
                    </p>
                  </div>

                  {/* Actions Menu */}
                  {isOwner && !isEditing && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleStartEdit(comment)}>
                          <Edit2 className="mr-2 h-3 w-3" />
                          {t.actions.edit}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-3 w-3" />
                          {t.actions.delete}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {/* Comment Content */}
                {isEditing ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[80px] resize-none"
                      autoFocus
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleUpdateComment(comment.id)}
                        disabled={!editContent.trim() || isSubmitting}
                      >
                        {isSubmitting ? t.actions.saving : t.actions.save}
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                        {t.actions.cancel}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm prose prose-sm dark:prose-invert max-w-none break-words [&>p]:mb-0 [&>p]:mt-0">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {comment.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {comments.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground border border-dashed rounded-lg">
            {t.empty}
          </div>
        )}
      </div>

      {/* New Comment Form */}
      <div className="space-y-2">
        <MentionTextarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={t.placeholder}
          className="min-h-[100px] resize-none"
          users={users}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleCreateComment();
            }
          }}
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {t.shortcut}
          </p>
          <Button
            onClick={handleCreateComment}
            disabled={!newComment.trim() || isSubmitting}
            size="sm"
          >
            <Send className="mr-2 h-4 w-4" />
            {isSubmitting ? t.actions.sending : t.actions.send}
          </Button>
        </div>
      </div>
    </div>
  );
}
