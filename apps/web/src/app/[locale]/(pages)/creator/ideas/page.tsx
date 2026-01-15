
"use client";

import React from "react";
import { AppLayout } from "@/components/shared/app-layout";
import { IdeaCard, Button } from "@ordo-todo/ui";
import { Plus } from "lucide-react";
import { useIdeas } from "@/lib/api-hooks";

export default function IdeasPage() {
  const { data: ideasData } = useIdeas({ status: 'ACTIVE' });
  const ideas = ideasData?.data || [];

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
           <div>
             <h1 className="text-2xl font-bold">Ideas</h1>
             <p className="text-muted-foreground">Capture and refine your content concepts.</p>
           </div>
           <Button className="gap-2">
             <Plus className="w-4 h-4" />
             New Idea
           </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {ideas.map((idea) => (
              <div key={idea.id} className="hover:shadow-lg transition-shadow duration-200 rounded-xl">
                 <IdeaCard 
                    idea={idea} 
                    onClick={() => console.log('View idea', idea.id)}
                 />
              </div>
           ))}
        </div>
      </div>
    </AppLayout>
  );
}
