
"use client";

import React from "react";
import { AppLayout } from "@/components/shared/app-layout";
import { SocialPostCard, Button } from "@ordo-todo/ui";
import { Calendar } from "lucide-react";
import { useScheduledPosts } from "@/lib/api-hooks";

export default function PublishingPage() {
  const { data: postsData } = useScheduledPosts({ limit: 50 });
  const posts = (postsData?.data || []).map(post => ({
    ...post,
    scheduledAt: post.scheduledAt ? new Date(post.scheduledAt) : undefined,
    publishedAt: post.publishedAt ? new Date(post.publishedAt) : undefined,
  }));

  return (
    <AppLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
           <div>
             <h1 className="text-2xl font-bold">Publishing</h1>
             <p className="text-muted-foreground">Manage your social media schedule.</p>
           </div>
           <Button variant="outline" className="gap-2">
             <Calendar className="w-4 h-4" />
             View Calendar
           </Button>
        </div>

        <div className="space-y-4">
           {posts.map((post) => (
              <SocialPostCard 
                 key={post.id}
                 post={post} 
                 onClick={() => console.log('View post', post.id)}
                 className="bg-card hover:bg-card/80 transition-colors"
              />
           ))}
        </div>
      </div>
    </AppLayout>
  );
}
