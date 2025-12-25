"use client";

import { usePublicTask } from "@/lib/api-hooks";
import { Badge, Skeleton, Card, CardContent, CardHeader, CardTitle, Separator } from "@ordo-todo/ui";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { CheckSquare, Calendar, Clock, AlertCircle } from "lucide-react";

export default function PublicTaskPage() {
  const params = useParams();
  const token = params.token as string;
  const { data: task, isLoading, error } = usePublicTask(token);

  if (isLoading) {
    return (
      <div className="container max-w-3xl mx-auto py-10 px-4">
        <Card>
          <CardHeader className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-px w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="container max-w-3xl mx-auto py-10 px-4 flex flex-col items-center justify-center text-center min-h-[50vh]">
        <div className="bg-destructive/10 p-4 rounded-full mb-4">
          <AlertCircle className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Task Not Found</h1>
        <p className="text-muted-foreground">
          The task you are looking for does not exist or the link has expired.
        </p>
      </div>
    );
  }

  const priorityColors = {
    LOW: "bg-slate-500",
    MEDIUM: "bg-blue-500",
    HIGH: "bg-orange-500",
    URGENT: "bg-red-500",
  };

  const statusColors = {
    TODO: "bg-slate-500",
    IN_PROGRESS: "bg-blue-500",
    COMPLETED: "bg-green-500",
    CANCELLED: "bg-red-500",
  };

  return (
    <div className="min-h-screen bg-muted/10 py-10 px-4">
      <div className="container max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <CheckSquare className="w-4 h-4" />
            <span>Shared Task</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Ordo Todo
          </div>
        </div>

        <Card className="border-t-4 shadow-lg" style={{ borderTopColor: task.project?.color || '#2563EB' }}>
          <CardHeader className="space-y-4 pb-2">
            <div className="flex flex-wrap gap-2 mb-2">
              <Badge variant="outline" className={`${statusColors[task.status as keyof typeof statusColors]} text-white border-none`}>
                {task.status.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className={`${priorityColors[task.priority as keyof typeof priorityColors]} text-white border-none`}>
                {task.priority}
              </Badge>
              {task.project && (
                <Badge variant="secondary" style={{ color: task.project.color, backgroundColor: `${task.project.color}15` }}>
                  {task.project.name}
                </Badge>
              )}
            </div>
            <CardTitle className="text-2xl md:text-3xl font-bold leading-tight">
              {task.title}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-8 pt-6">
            {/* Description */}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {task.description ? (
                <p className="whitespace-pre-wrap leading-relaxed text-foreground/90">
                  {task.description}
                </p>
              ) : (
                <p className="text-muted-foreground italic">No description provided.</p>
              )}
            </div>

            <Separator />

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {task.dueDate && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Due Date</p>
                    <p className="font-medium mt-0.5">
                      {format(new Date(task.dueDate), "PPP")}
                    </p>
                  </div>
                </div>
              )}
              
              {task.estimatedTime && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Estimated Time</p>
                    <p className="font-medium mt-0.5">{task.estimatedTime} minutes</p>
                  </div>
                </div>
              )}

              {task.assignee && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary mt-0.5">
                    {task.assignee.name?.[0] || 'U'}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Assignee</p>
                    <p className="font-medium mt-0.5">{task.assignee.name || 'Unknown'}</p>
                  </div>
                </div>
              )}

              {task.owner && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary mt-0.5">
                    {task.owner.name?.[0] || 'U'}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Created By</p>
                    <p className="font-medium mt-0.5">{task.owner.name || 'Unknown'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Subtasks */}
            {task.subTasks && task.subTasks.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <CheckSquare className="w-4 h-4" />
                  Subtasks ({task.subTasks.filter((st: any) => st.status === 'COMPLETED').length}/{task.subTasks.length})
                </h3>
                <div className="space-y-2">
                  {task.subTasks.map((subtask: any) => (
                    <div key={subtask.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card/50">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${subtask.status === 'COMPLETED' ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground'}`}>
                        {subtask.status === 'COMPLETED' && <CheckSquare className="w-3 h-3" />}
                      </div>
                      <span className={subtask.status === 'COMPLETED' ? 'line-through text-muted-foreground' : ''}>
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
