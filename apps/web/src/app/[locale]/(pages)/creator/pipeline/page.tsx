
"use client";

import React from "react";
import { AppLayout } from "@/components/shared/app-layout";
import { ContentPipeline } from "@ordo-todo/ui";
import { useContentPipeline } from "@/lib/api-hooks";

export default function PipelinePage() {
  const { data: pipelineData } = useContentPipeline();
  const pipeline = pipelineData || { scripting: [], filming: [], editing: [], scheduled: [], published: [] };

  return (
    <AppLayout>
      <div className="h-[calc(100vh-100px)] flex flex-col">
        <div className="flex items-center justify-between mb-6 px-4 md:px-0">
           <div>
             <h1 className="text-2xl font-bold">Content Pipeline</h1>
             <p className="text-muted-foreground">Manage your production workflow.</p>
           </div>
        </div>

        <div className="flex-1 overflow-hidden rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm">
           <ContentPipeline 
              pipeline={pipeline}
              onContentClick={(id) => console.log('View content', id)}
           />
        </div>
      </div>
    </AppLayout>
  );
}
