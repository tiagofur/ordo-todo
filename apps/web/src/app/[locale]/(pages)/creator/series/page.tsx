
"use client";

import React from "react";
import { AppLayout } from "@/components/shared/app-layout";
import { SeriesCard, Button } from "@ordo-todo/ui";
import { Plus } from "lucide-react";
import { useSeries } from "@/lib/api-hooks";

export default function SeriesPage() {
  const { data: series } = useSeries();
  const safeSeries = series || [];

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
           <div>
             <h1 className="text-2xl font-bold">Series</h1>
             <p className="text-muted-foreground">Organize your content into collections.</p>
           </div>
           <Button className="gap-2">
             <Plus className="w-4 h-4" />
             New Series
           </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {safeSeries.map((series) => (
              <SeriesCard 
                 key={series.id}
                 series={series} 
                 onClick={() => console.log('View series', series.id)}
                 className="hover:scale-[1.02] transition-transform duration-200"
              />
           ))}
        </div>
      </div>
    </AppLayout>
  );
}
