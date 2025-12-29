'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { getRoadmapItems, voteRoadmapItem, removeRoadmapVote } from '@/lib/api';
import type { RoadmapItem } from '@/lib/api';
import { Button } from '@ordo-todo/ui';
import { 
  ThumbsUp, 
  Lightbulb, 
  Clock, 
  Rocket, 
  CheckCircle2, 
  XCircle,
  LogIn,
  Star
} from 'lucide-react';
import { LoginButton } from '@/components/login-button';

const statusConfig: Record<string, { 
  label: string; 
  icon: typeof Lightbulb; 
  color: string;
  bg: string;
}> = {
  CONSIDERING: { label: 'Considering', icon: Lightbulb, color: 'text-[#F97316]', bg: 'bg-[#F97316]/10' },
  PLANNED: { label: 'Planned', icon: Clock, color: 'text-[#06B6D4]', bg: 'bg-[#06B6D4]/10' },
  IN_PROGRESS: { label: 'In Progress', icon: Rocket, color: 'text-[#EC4899]', bg: 'bg-[#EC4899]/10' },
  COMPLETED: { label: 'Completed', icon: CheckCircle2, color: 'text-[#10B981]', bg: 'bg-[#10B981]/10' },
  DECLINED: { label: 'Declined', icon: XCircle, color: 'text-gray-500', bg: 'bg-gray-500/10' },
};

const voteWeights: Record<string, number> = {
  FREE: 1,
  PRO: 3,
  TEAM: 5,
  ENTERPRISE: 10,
};

export default function RoadmapPage() {
  const { user, isAuthenticated, login } = useAuth();
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [votedItems, setVotedItems] = useState<Set<string>>(new Set());
  const [votingItem, setVotingItem] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRoadmap();
  }, []);

  const loadRoadmap = async () => {
    const data = await getRoadmapItems();
    setItems(data);
  };

  const handleVote = async (itemId: string) => {
    if (!isAuthenticated) {
      login();
      return;
    }

    if (votingItem) return;
    setVotingItem(itemId);
    setError(null);

    try {
      if (votedItems.has(itemId)) {
        // Remove vote
        await removeRoadmapVote(itemId);
        setVotedItems(prev => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
        // Update local count
        setItems(prev => prev.map(item => 
          item.id === itemId 
            ? { ...item, totalVotes: item.totalVotes - (voteWeights[user?.subscriptionTier || 'FREE'] || 1) }
            : item
        ));
      } else {
        // Add vote
        const result = await voteRoadmapItem(itemId);
        if (result.success) {
          setVotedItems(prev => new Set([...prev, itemId]));
          // Update local count
          setItems(prev => prev.map(item => 
            item.id === itemId 
              ? { ...item, totalVotes: item.totalVotes + result.weight }
              : item
          ));
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === 'LOGIN_REQUIRED') {
          login();
        } else if (err.message === 'ALREADY_VOTED') {
          setVotedItems(prev => new Set([...prev, itemId]));
        } else {
          setError('Failed to vote. Please try again.');
        }
      }
    } finally {
      setVotingItem(null);
    }
  };

  const userWeight = voteWeights[user?.subscriptionTier || 'FREE'] || 1;

  // Group by status
  const groupedItems = items.reduce((acc, item) => {
    const status = item.status || 'CONSIDERING';
    if (!acc[status]) acc[status] = [];
    acc[status].push(item);
    return acc;
  }, {} as Record<string, RoadmapItem[]>);

  const statusOrder = ['IN_PROGRESS', 'PLANNED', 'CONSIDERING', 'COMPLETED', 'DECLINED'];

  return (
    <div className="min-h-screen bg-background pt-24">
      {/* Header */}
      <section className="py-16 px-4 md:px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-[#EC4899]/10 text-[#EC4899] mb-6"
          >
            Public Roadmap
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-foreground mb-6"
          >
            What's Next for Ordo Todo
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            Vote for features you want to see. Your feedback shapes our development priorities.
          </motion.p>

          {/* Vote Power Info */}
          {isAuthenticated && user && userWeight > 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F97316]/10 text-[#F97316] font-medium"
            >
              <Star className="h-4 w-4" />
              Your votes count as {userWeight}x ({user.subscriptionTier})
            </motion.div>
          )}

          {!isAuthenticated && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3"
            >
              <p className="text-sm text-muted-foreground">
                Login to vote. PRO users get 3x vote power!
              </p>
              <LoginButton />
            </motion.div>
          )}
        </div>
      </section>

      {/* Roadmap Items */}
      <section className="py-12 px-4 md:px-6">
        <div className="container mx-auto max-w-4xl">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-center">
              {error}
            </div>
          )}

          {statusOrder.map(status => {
            const statusItems = groupedItems[status];
            if (!statusItems?.length) return null;

            const config = statusConfig[status];
            const StatusIcon = config.icon;

            return (
              <div key={status} className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-2 rounded-xl ${config.bg}`}>
                    <StatusIcon className={`h-5 w-5 ${config.color}`} />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">{config.label}</h2>
                  <span className="text-sm text-muted-foreground">({statusItems.length})</span>
                </div>

                <div className="space-y-4">
                  {statusItems
                    .sort((a, b) => b.totalVotes - a.totalVotes)
                    .map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group bg-card rounded-xl border-2 border-border hover:border-[#06B6D4]/30 p-6 transition-all"
                      >
                        <div className="flex items-start gap-4">
                          {/* Vote Button */}
                          <button
                            onClick={() => handleVote(item.id)}
                            disabled={votingItem === item.id}
                            className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all min-w-[70px] ${
                              votedItems.has(item.id)
                                ? 'bg-[#06B6D4] border-[#06B6D4] text-white'
                                : 'bg-muted/50 border-border hover:border-[#06B6D4] text-muted-foreground hover:text-[#06B6D4]'
                            }`}
                          >
                            {votingItem === item.id ? (
                              <span className="h-5 w-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                            ) : (
                              <ThumbsUp className={`h-5 w-5 ${votedItems.has(item.id) ? '' : 'group-hover:scale-110'} transition-transform`} />
                            )}
                            <span className="text-lg font-bold mt-1">{item.totalVotes}</span>
                          </button>

                          {/* Content */}
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                              {item.title}
                            </h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>
            );
          })}

          {items.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">
                No roadmap items yet. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
