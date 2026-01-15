/**
 * Creator Hub Page - Desktop
 *
 * Main dashboard for content creators with Ideas, Pipeline, Series, and Publishing.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  Lightbulb,
  Video,
  Layers,
  Calendar,
  ArrowRight,
  Plus,
} from 'lucide-react';

import {
  Button,
  Card,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ConsistencyScore,
  IdeaCard,
  ContentPipeline,
  SeriesCard,
  SocialPostCard
} from '@ordo-todo/ui';

import { PageTransition, SlideIn } from '@/components/motion';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: any;
  color: string;
  onClick: () => void;
}

function QuickActionCard({
  title,
  description,
  icon: Icon,
  color,
  onClick,
}: QuickActionCardProps) {
  return (
    <Card
      className="p-6 cursor-pointer hover:border-primary/50 transition-all duration-200 group relative overflow-hidden"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
          style={{ backgroundColor: `${color}15`, color }}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity -mr-2 -mt-2">
          <Button variant="ghost" size="sm" className="rounded-full w-8 h-8 p-0">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground">{description}</p>

      {/* Decorative gradient blob */}
      <div
        className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none"
        style={{ backgroundColor: color }}
      />
    </Card>
  );
}

import {
  useIdeas,
  useContentPieces,
  useSeries,
  useContentPipeline,
  useScheduledPosts 
} from '@/hooks/api';

export function CreatorHub() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Real Data Hooks
  const { data: ideasData } = useIdeas({ limit: 10, status: 'ACTIVE' });
  const ideas = ideasData?.data || [];
  
  const { data: pipelineData } = useContentPipeline(); 
  const pipeline = pipelineData || { scripting: [], filming: [], editing: [], scheduled: [], published: [] };

  const { data: series } = useSeries();

  // Publishing Hooks
  const { data: scheduledData } = useScheduledPosts({ limit: 20 });
  const posts = scheduledData?.data || []; 


  return (
    <PageTransition>
      <div className="space-y-6 h-[calc(100vh-80px)] flex flex-col">
        {/* Header */}
        <SlideIn direction="top">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg"
                  style={{
                    backgroundColor: '#EAB308',
                    boxShadow: '0 10px 15px -3px rgba(234, 179, 8, 0.4), 0 4px 6px -4px rgba(234, 179, 8, 0.4)',
                  }}
                >
                  <Sparkles className="h-6 w-6" />
                </div>
                Creator OS
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage your content empire from ideation to distribution.
              </p>
            </div>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Idea
            </Button>
          </div>
        </SlideIn>

        {/* Tabs */}
        <SlideIn delay={0.1}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-2xl grid-cols-5">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="ideas">Ideas</TabsTrigger>
              <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
              <TabsTrigger value="series">Series</TabsTrigger>
              <TabsTrigger value="publishing">Publishing</TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="mt-6 flex-1 overflow-hidden">
              <div className="space-y-6 h-full overflow-y-auto pb-6">
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
                    <h3 className="font-semibold text-indigo-400 mb-2">
                      Pro Tip
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Consistency is key! Publish at least one piece of
                      content per week to maintain your streak and boost your
                      score.
                    </p>
                  </Card>
                </div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <QuickActionCard
                    title="Ideas"
                    description="Capture and organize your content concepts."
                    icon={Lightbulb}
                    color="#EAB308"
                    onClick={() => setActiveTab('ideas')}
                  />
                  <QuickActionCard
                    title="Pipeline"
                    description="Track production from script to publish."
                    icon={Video}
                    color="#A855F7"
                    onClick={() => setActiveTab('pipeline')}
                  />
                  <QuickActionCard
                    title="Series"
                    description="Manage episodic and thematic content."
                    icon={Layers}
                    color="#EC4899"
                    onClick={() => setActiveTab('series')}
                  />
                  <QuickActionCard
                    title="Publishing"
                    description="Schedule posts and track performance."
                    icon={Calendar}
                    color="#3B82F6"
                    onClick={() => setActiveTab('publishing')}
                  />
                </div>

                {/* Recent Ideas Preview */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Recent Ideas</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ideas.slice(0, 3).map((idea) => (
                      <div
                        key={idea.id}
                        className="hover:shadow-lg transition-shadow duration-200 rounded-xl"
                      >
                        <IdeaCard
                          idea={idea}
                          onClick={() => console.log('View idea', idea.id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Ideas Tab */}
            <TabsContent value="ideas" className="mt-6 flex-1 overflow-hidden">
              <div className="space-y-6 h-full overflow-y-auto pb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Ideas</h2>
                    <p className="text-muted-foreground">
                      Capture and refine your content concepts.
                    </p>
                  </div>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    New Idea
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ideas.map((idea) => (
                    <div
                      key={idea.id}
                      className="hover:shadow-lg transition-shadow duration-200 rounded-xl"
                    >
                      <IdeaCard
                        idea={idea}
                        onClick={() => console.log('View idea', idea.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Pipeline Tab */}
            <TabsContent value="pipeline" className="mt-6 flex-1 overflow-hidden">
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">Content Pipeline</h2>
                    <p className="text-muted-foreground">
                      Manage your production workflow.
                    </p>
                  </div>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Content
                  </Button>
                </div>

                {/* Pipeline content needs scrolling */}
                <div className="flex-1 overflow-hidden rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm">
                   <ContentPipeline
                    pipeline={pipeline}
                    onContentClick={(id) => console.log('View content', id)}
                   />
                </div>
              </div>
            </TabsContent>

            {/* Series Tab */}
            <TabsContent value="series" className="mt-6 flex-1 overflow-hidden">
              <div className="space-y-6 h-full overflow-y-auto pb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Series</h2>
                    <p className="text-muted-foreground">
                      Organize your content into collections.
                    </p>
                  </div>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    New Series
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Add fallback check for series array */}
                    {(series || []).map((s) => (
                        <SeriesCard 
                            key={s.id}
                            series={s} 
                            onClick={() => console.log('View series', s.id)}
                            className="hover:scale-[1.02] transition-transform duration-200"
                        />
                    ))}
                </div>
              </div>
            </TabsContent>

            {/* Publishing Tab */}
            <TabsContent value="publishing" className="mt-6 flex-1 overflow-hidden">
              <div className="space-y-6 h-full overflow-y-auto pb-6">
                 <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">Publishing</h2>
                        <p className="text-muted-foreground">Manage your social media schedule.</p>
                    </div>
                    <Button variant="outline" className="gap-2">
                        <Calendar className="w-4 h-4" />
                        View Calendar
                    </Button>
                 </div>

                 <div className="space-y-4">
                    {posts.map((post: any) => (
                        <SocialPostCard 
                            key={post.id}
                            post={post} 
                            onClick={() => console.log('View post', post.id)}
                            className="bg-card hover:bg-card/80 transition-colors"
                        />
                    ))}
                 </div>
              </div>
            </TabsContent>
          </Tabs>
        </SlideIn>
      </div>
    </PageTransition>
  );
}

