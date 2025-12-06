"use client";

import { useState } from "react";
import { useCreateTask } from "@/lib/api-hooks";
import { Button } from "../ui/button.js";
import { Input } from "../ui/input.js";
import { Label } from "../ui/label.js";
import { notify } from "@/lib/notify";
import { useTranslations } from "next-intl";

export function TaskForm({ projectId }: { projectId?: string }) {
  const t = useTranslations('TaskForm');
  const [title, setTitle] = useState("");

  const createTask = useCreateTask();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !projectId) {
        if (!projectId) notify.error(t('toast.projectIdRequired'));
        return;
    }
    createTask.mutate({ title, projectId }, {
      onSuccess: () => {
        setTitle("");
        notify.success(t('toast.success'));
      },
      onError: (error: any) => {
        notify.error(t('toast.error', { message: error.message }));
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="title">{t('label')}</Label>
        <Input
          type="text"
          id="title"
          placeholder={t('placeholder')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={createTask.isPending}
        />
      </div>
      <Button type="submit" disabled={createTask.isPending}>
        {createTask.isPending ? t('button.adding') : t('button.add')}
      </Button>
    </form>
  );
}
