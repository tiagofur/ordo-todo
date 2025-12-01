"use client";

import { useState } from "react";
import { useCreateTask } from "@/lib/api-hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function TaskForm({ projectId }: { projectId?: string }) {
  const [title, setTitle] = useState("");

  const createTask = useCreateTask();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !projectId) {
        if (!projectId) toast.error("Project ID is required");
        return;
    }
    createTask.mutate({ title, projectId }, {
      onSuccess: () => {
        setTitle("");
        toast.success("Task created!");
      },
      onError: (error: any) => {
        toast.error(`Error: ${error.message}`);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="title">New Task</Label>
        <Input
          type="text"
          id="title"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={createTask.isPending}
        />
      </div>
      <Button type="submit" disabled={createTask.isPending}>
        {createTask.isPending ? "Adding..." : "Add"}
      </Button>
    </form>
  );
}
