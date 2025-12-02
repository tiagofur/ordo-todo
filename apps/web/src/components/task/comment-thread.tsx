"use client";

import { useState } from "react";
import { Send, Edit2, Trash2, MoreVertical } from "lucide-react";
import { useCreateComment, useUpdateComment, useDeleteComment } from "@/lib/api-hooks";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useTranslations, useLocale } from "next-intl";

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

interface CommentThreadProps {
  taskId: string;
  comments?: Comment[];
  currentUserId?: string;
}

export function CommentThread({ taskId, comments = [], currentUserId }: CommentThreadProps) {
  const t = useTranslations('CommentThread');
  const locale = useLocale();
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editContent, setEditContent] = useState("");

  // Create comment mutation
  const createComment = useCreateComment();

  // Update comment mutation
  const updateComment = useUpdateComment();

  // Delete comment mutation
  const deleteComment = useDeleteComment();

  const handleCreateComment = () => {
    if (!newComment.trim()) return;

    createComment.mutate({
      taskId,
      content: newComment,
    }, {
      onSuccess: () => {
        toast.success(t('toast.added'));
        setNewComment("");
      },
      onError: (error: any) => {
        toast.error(error.message || t('toast.addError'));
      }
    });
  };

  const handleUpdateComment = (commentId: string | number) => {
    if (!editContent.trim()) return;

    updateComment.mutate({
      commentId: String(commentId),
      data: { content: editContent },
    }, {
      onSuccess: () => {
        toast.success(t('toast.updated'));
        setEditingId(null);
        setEditContent("");
      },
      onError: (error: any) => {
        toast.error(error.message || t('toast.updateError'));
      }
    });
  };

  const handleDeleteComment = (commentId: string | number) => {
    if (confirm(t('confirmDelete'))) {
      deleteComment.mutate(String(commentId), {
        onSuccess: () => {
          toast.success(t('toast.deleted'));
        },
        onError: (error: any) => {
          toast.error(error.message || t('toast.deleteError'));
        }
      });
    }
  };

  const handleStartEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTimestamp = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: locale === 'es' ? es : enUS });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          {t('title')} {comments.length > 0 && `(${comments.length})`}
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
                        <span className="ml-1">{t('edited')}</span>
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
                          {t('actions.edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-3 w-3" />
                          {t('actions.delete')}
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
                        disabled={!editContent.trim() || updateComment.isPending}
                      >
                        {updateComment.isPending ? t('actions.saving') : t('actions.save')}
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                        {t('actions.cancel')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap break-words">{comment.content}</p>
                )}
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {comments.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground border border-dashed rounded-lg">
            {t('empty')}
          </div>
        )}
      </div>

      {/* New Comment Form */}
      <div className="space-y-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={t('placeholder')}
          className="min-h-[100px] resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              handleCreateComment();
            }
          }}
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {t('shortcut')}
          </p>
          <Button
            onClick={handleCreateComment}
            disabled={!newComment.trim() || createComment.isPending}
            size="sm"
          >
            <Send className="mr-2 h-4 w-4" />
            {createComment.isPending ? t('actions.sending') : t('actions.send')}
          </Button>
        </div>
      </div>
    </div>
  );
}
