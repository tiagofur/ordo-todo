'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { addBlogComment } from '@/lib/api';
import type { BlogComment } from '@/lib/api';
import { Button } from '@ordo-todo/ui';
import { Send, Trash2, LogIn, User, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CommentSectionProps {
  slug: string;
  initialComments?: BlogComment[];
}

export function CommentSection({ slug, initialComments = [] }: CommentSectionProps) {
  const { user, isAuthenticated, login } = useAuth();
  const [comments, setComments] = useState<BlogComment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !isAuthenticated) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const comment = await addBlogComment(slug, newComment.trim());
      if (comment) {
        setComments([comment, ...comments]);
        setNewComment('');
      }
    } catch (err) {
      if (err instanceof Error && err.message === 'LOGIN_REQUIRED') {
        login();
      } else {
        setError('Failed to add comment. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-12 pt-8 border-t border-border">
      <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
        <MessageCircle className="h-6 w-6 text-[#06B6D4]" />
        Comments ({comments.length})
      </h2>

      {/* Comment Form */}
      {isAuthenticated && user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex items-start gap-3">
            {user.image ? (
              <img 
                src={user.image} 
                alt={user.name} 
                className="h-10 w-10 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-[#06B6D4] flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-white" />
              </div>
            )}
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border-2 border-border bg-background focus:border-[#06B6D4] focus:outline-none transition-colors resize-none"
              />
              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
              <div className="flex justify-end mt-3">
                <Button
                  type="submit"
                  disabled={!newComment.trim() || isSubmitting}
                  className="bg-[#06B6D4] hover:bg-[#0891B2] text-white"
                >
                  {isSubmitting ? (
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Post Comment
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-6 bg-muted/50 rounded-xl border-2 border-dashed border-border text-center">
          <p className="text-muted-foreground mb-4">
            Login to join the conversation
          </p>
          <Button onClick={login} className="bg-[#06B6D4] hover:bg-[#0891B2] text-white">
            <LogIn className="h-4 w-4 mr-2" />
            Login to Comment
          </Button>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        <AnimatePresence>
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-start gap-3"
            >
              {comment.user.image ? (
                <img 
                  src={comment.user.image} 
                  alt={comment.user.name} 
                  className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-[#EC4899] flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-white" />
                </div>
              )}
              <div className="flex-1 bg-card rounded-xl p-4 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground">{comment.user.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-muted-foreground">{comment.content}</p>
                {user?.id === comment.user.id && (
                  <button className="mt-2 text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {comments.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No comments yet. Be the first to share your thoughts!
          </p>
        )}
      </div>
    </div>
  );
}
