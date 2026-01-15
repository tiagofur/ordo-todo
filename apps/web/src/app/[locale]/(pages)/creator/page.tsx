
"use client";

import React from "react";
import { AppLayout } from "@/components/shared/app-layout";
import { 
  ConsistencyScore, 
  Button, 
  Card,
  cn 
} from "@ordo-todo/ui";
import { useRouter } from "next/navigation";
import { 
  Lightbulb, 
  Video, 
  Layers, 
  Calendar, 
  ArrowRight,
  Sparkles
} from "lucide-react";
import { useTranslations } from "next-intl";

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: any;
  color: string;
  href: string;
}

function QuickActionCard({ title, description, icon: Icon, color, href }: QuickActionCardProps) {
  const router = useRouter();
  
  return (
    <Card 
      className="p-6 cursor-pointer hover:border-primary/50 transition-all duration-200 group relative overflow-hidden"
      onClick={() => router.push(href)}
    >
      <div className="flex items-start justify-between mb-4">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
          style={{ backgroundColor: `${color}15`, color: color }}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity -mr-2 -mt-2">
           <Button variant="ghost" size="sm" className="rounded-full w-8 h-8 p-0">
             <ArrowRight className="w-4 h-4" />
           </Button>
        </div>
      </div>
      
      <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      
      {/* Decorative gradient blob */}
      <div 
        className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none"
        style={{ backgroundColor: color }}
      />
    </Card>
  );
}

export default function CreatorDashboardPage() {
  const t = useTranslations("Dashboard"); // Using Dashboard namespace for now
  
  return (
    <AppLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-yellow-500" />
              Creator OS
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your content empire from ideation to distribution.
            </p>
          </div>
          <Button>
             New Idea
          </Button>
        </div>

        {/* Consistency Score Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-2">
              <ConsistencyScore 
                score={85}
                currentStreak={12}
                longestStreak={15}
                publishedThisWeek={4}
                targetThisWeek={5}
                className="h-full bg-card/50 backdrop-blur-sm"
              />
           </div>
           
           <Card className="p-6 flex flex-col justify-center bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
              <h3 className="font-semibold text-indigo-400 mb-2">Pro Tip</h3>
              <p className="text-sm text-muted-foreground">
                Consistency is key! Publish at least one piece of content per week to maintain your streak and boost your score.
              </p>
           </Card>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <QuickActionCard 
            title="Ideas"
            description="Capture and organize your content concepts."
            icon={Lightbulb}
            color="#EAB308" // Yellow
            href="/creator/ideas"
          />
          <QuickActionCard 
            title="Pipeline"
            description="Track production from script to publish."
            icon={Video}
            color="#A855F7" // Purple
            href="/creator/pipeline"
          />
          <QuickActionCard 
            title="Series"
            description="Manage episodic and thematic content."
            icon={Layers}
            color="#EC4899" // Pink
            href="/creator/series"
          />
          <QuickActionCard 
            title="Publishing"
            description="Schedule posts and track performance."
            icon={Calendar}
            color="#3B82F6" // Blue
            href="/creator/publishing"
          />
        </div>

      </div>
    </AppLayout>
  );
}
