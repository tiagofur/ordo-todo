'use client';

import { useState } from 'react';
import { Send, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui';
import { Textarea } from '@/components/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui';
import { formatDistanceToNow } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import { MentionTextarea } from '@/components/ui';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Comment } from '@ordo-todo/api-client';
import { useConfirm } from '@/components/shared/confirm-dialog';

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
  onCreate?: (
    content: string,
    mentionedUserIds?: string[],
  ) => Promise<void> | void;
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

/** Renders data-mention emphasis nodes as chips; plain emphasis stays <em>.
 * react-markdown v10 spreads data.hProperties as element props. */
function MentionEm(props: any) {
  if (props?.["data-mention"] === "true") {
    return (
      <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary align-baseline">
        {props.children}
      </span>
    );
  }
  return <em>{props.children}</em>;
}

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
  const { confirm, ConfirmModal } = useConfirm();
  const t = {
    ...DEFAULT_LABELS,
    ...labels,
    actions: { ...DEFAULT_LABELS.actions, ...labels.actions },
  };

  const [newComment, setNewComment] = useState('');
  const [mentionedIds, setMentionedIds] = useState<string[]>([]);

  // Keep the picked IDs in sync with the text: the backend skips its
  // name fallback when the array is present, so a stale ID (member picked,
  // then the text edited) would notify someone the text no longer mentions.
  const handleChangeDraft = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNewComment(value);
    setMentionedIds((prev) =>
      prev.filter((id) => {
        const user = users.find((u) => u.id === id);
        return (
          !!user && value.toLowerCase().includes(`@${user.name.toLowerCase()}`)
        );
      }),
    );
  };
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to wrap promise with loading state
  const handleAction = async (action: () => Promise<void> | void) => {
    setIsSubmitting(true);
    try {
      await action();
    } catch (e) {
      if (process.env.NODE_ENV === 'development') console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateComment = () => {
    if (!newComment.trim() || !onCreate) return;
    handleAction(async () => {
      await onCreate(newComment, mentionedIds.length > 0 ? mentionedIds : undefined);
      setNewComment('');
      setMentionedIds([]);
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

  const handleDeleteComment = async (commentId: string | number) => {
    if (!onDelete) return;
    const ok = await confirm({
      title: t.actions.delete,
      description: t.confirmDelete,
      variant: 'destructive',
    });
    if (ok) {
      try {
         await onDelete(String(commentId));
      } catch(e) { if (process.env.NODE_ENV === 'development') console.error(e); }
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

  // ODD 018 S5: remark plugin that splits text nodes on exact "@Name"
  // member matches (longest name first). Matches become emphasis nodes tagged
  // with data-mention, rendered as chips by the `em` override below.
  // Text-node only: markdown structure (lists, code fences) is untouched.
  const remarkMentionMembers = () => (tree: any) => {
    const named = [...users]
      .filter((u) => !!u.name)
      .sort((a, b) => b.name.length - a.name.length);
    if (named.length === 0) return tree;

    const escaped = named
      .map((u) => u.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|");
    const pattern = new RegExp(`@(${escaped})(?![\\p{L}\\p{N}_])`, "giu");

    const walk = (node: any): void => {
      if (!Array.isArray(node.children)) return;
      node.children = node.children.flatMap((child: any) => {
        if (child.type === "text") {
          const value = String(child.value);
          const parts: any[] = [];
          let last = 0;
          const key = 0;
          for (const match of value.matchAll(pattern)) {
            const index = match.index ?? 0;
            if (index > last) parts.push({ type: "text", value: value.slice(last, index) });
            parts.push({
              type: "emphasis",
              data: { hProperties: { "data-mention": "true" } },
              children: [{ type: "text", value: match[0] }],
            });
            last = index + match[0].length;
          }
          if (last < value.length) parts.push({ type: "text", value: value.slice(last) });
          return parts;
        }
        walk(child);
        return [child];
      });
    };
    walk(tree);
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
          const author = comment.author || { id: 'unknown', name: 'Unknown User', image: null };
          const isOwner = currentUserId && author.id === currentUserId;

          return (
            <div
              key={comment.id}
              className="flex gap-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors"
            >
              {/* Avatar */}
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={author.image || undefined} alt={author.name || ''} />
                <AvatarFallback className="text-xs">
                  {getInitials(author.name || '??')}
                </AvatarFallback>
              </Avatar>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-2">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{author.name}</p>
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
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMentionMembers]}
                      components={{ em: MentionEm }}
                    >
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
          onChange={handleChangeDraft}
          placeholder={t.placeholder}
          className="min-h-[100px] resize-none"
          users={users}
          onMention={(userId) =>
            setMentionedIds((prev) =>
              prev.includes(userId) ? prev : [...prev, userId],
            )
          }
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
      <ConfirmModal />
    </div>
  );
}
