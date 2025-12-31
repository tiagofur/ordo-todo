# Platform-Agnostic Pattern for @ordo-todo/ui

> **Goal:** Make all components in `packages/ui` platform-agnostic (usable in web, mobile, desktop)
> **Status:** In Progress - Fase 1, Tarea 1.2

## 🎯 Core Principles

1. **NO `'use client'` directive** in any component
2. **NO React Hooks** inside components (useState, useEffect, useMemo, useCallback, etc.)
3. **NO framework-specific code** (next-themes, next-intl, etc.)
4. **All state** managed by consuming apps and passed via props
5. **All callbacks** managed by consuming apps and passed via props
6. **All i18n labels** managed by consuming apps and passed via props

## 📋 Pattern Template

### ❌ BEFORE (Platform-Specific)

```typescript
"use client";

import { useState } from 'react';

export function TaskCard({ task }: { task: Task }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div>
      <button onClick={() => setIsExpanded(!isExpanded)}>
        {task.title}
      </button>
      {isExpanded && <p>{task.description}</p>}
    </div>
  );
}
```

### ✅ AFTER (Platform-Agnostic)

```typescript
// packages/ui/src/components/task/task-card.tsx (NO 'use client', NO hooks)

export interface TaskCardProps {
  task: Task;

  // State (controlled by parent)
  isExpanded: boolean;

  // Callbacks (controlled by parent)
  onToggleExpand: (taskId: string) => void;

  // Optional i18n labels
  labels?: {
    expand?: string;
    collapse?: string;
  };
}

export function TaskCard({
  task,
  isExpanded,
  onToggleExpand,
  labels
}: TaskCardProps) {
  return (
    <div>
      <button
        onClick={() => onToggleExpand(task.id)}
        aria-label={isExpanded ? labels?.collapse : labels?.expand}
      >
        {task.title}
      </button>
      {isExpanded && <p>{task.description}</p>}
    </div>
  );
}
```

### Consuming App (web/desktop/mobile)

```typescript
// apps/web/src/components/task/task-card-container.tsx
"use client";

import { TaskCard } from '@ordo-todo/ui';
import { useTasks } from '@/lib/api-hooks';

export function TaskCardContainer() {
  const { data: tasks } = useTasks();
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const toggleExpand = (taskId: string) => {
    setExpandedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  return (
    <div>
      {tasks?.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          isExpanded={expandedTasks.has(task.id)}
          onToggleExpand={toggleExpand}
          labels={{
            expand: 'Expand task',
            collapse: 'Collapse task'
          }}
        />
      ))}
    </div>
  );
}
```

## 🔧 Refactoring Guide

### Step 1: Identify State and Hooks

```bash
# Find components with hooks
grep -r "useState\|useEffect\|useMemo\|useCallback" packages/ui/src/ --include="*.tsx"

# Example output:
# packages/ui/src/components/task/task-card.tsx:  useState
# packages/ui/src/components/task/kanban-task-card.tsx: useState
```

### Step 2: Extract State to Props

```typescript
// BEFORE
export function MyComponent() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  // ...
}

// AFTER
export interface MyComponentProps {
  open: boolean;
  value: string;
  onOpenChange: (open: boolean) => void;
  onValueChange: (value: string) => void;
}

export function MyComponent({
  open,
  value,
  onOpenChange,
  onValueChange,
}: MyComponentProps) {
  // ...
}
```

### Step 3: Remove Imports

```typescript
// BEFORE
import { useState, useEffect, useMemo } from "react";

// AFTER (remove hooks, keep React types if needed)
import type { ChangeEvent } from "react";
```

### Step 4: Create Container Component (Optional)

For complex components, create a container component in consuming apps:

```typescript
// apps/web/src/components/my-component-container.tsx
"use client";

import { MyComponent } from '@ordo-todo/ui';

export function MyComponentContainer() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  return (
    <MyComponent
      open={open}
      value={value}
      onOpenChange={setOpen}
      onValueChange={setValue}
    />
  );
}
```

## 📦 Common Patterns

### 1. Dialog/Modal with Controlled Open

```typescript
export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
}
```

### 2. Form Inputs

```typescript
export interface InputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  label?: string;
}
```

### 3. Toggle/Switch

```typescript
export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}
```

### 4. List with Selection

```typescript
export interface ListProps<T> {
  items: T[];
  selectedIds: Set<string>;
  onSelect: (id: string) => void;
  onDeselect: (id: string) => void;
}
```

### 5. i18n Labels

```typescript
export interface ComponentProps {
  labels?: {
    title?: string;
    description?: string;
    actionLabel?: string;
    cancelLabel?: string;
    // ... other labels
  };
}
```

## 🚫 What to Avoid

### ❌ DON'T: Use hooks inside components

```typescript
// WRONG
export function Component() {
  const [state, setState] = useState();
  // ...
}
```

### ❌ DON'T: Use next-themes

```typescript
// WRONG
import { useTheme } from "next-themes";

export function Component() {
  const { theme } = useTheme();
  // ...
}
```

### ❌ DON'T: Use next-intl

```typescript
// WRONG
import { useTranslations } from "next-intl";

export function Component() {
  const t = useTranslations("Component");
  // ...
}
```

### ❌ DON'T: Use react-hook-form inside component

```typescript
// WRONG
import { useForm } from "react-hook-form";

export function Component() {
  const { control, handleSubmit } = useForm();
  // ...
}
```

### ❌ DON'T: Use TanStack Query inside component

```typescript
// WRONG
import { useQuery } from "@tanstack/react-query";

export function Component() {
  const { data } = useQuery({ queryKey: ["key"], queryFn: fetcher });
  // ...
}
```

## ✅ What to Do Instead

### ✅ DO: Pass data via props

```typescript
// CORRECT
export interface ComponentProps {
  data: DataType;
  theme?: "light" | "dark";
  labels?: Record<string, string>;
  onSubmit: (data: FormData) => void;
}
```

### ✅ DO: Create container components in consuming apps

```typescript
// apps/web/src/components/component-container.tsx
"use client";

import { Component } from '@ordo-todo/ui';
import { useData } from '@/lib/api-hooks';
import { useTranslations } from 'next-intl';

export function ComponentContainer() {
  const { data } = useData();
  const { theme } = useTheme();
  const t = useTranslations('Component');
  const { mutate } = useMutation({ mutationFn: submitData });

  return (
    <Component
      data={data}
      theme={theme}
      labels={{
        title: t('title'),
        submit: t('submit')
      }}
      onSubmit={mutate}
    />
  );
}
```

## 📋 Components to Refactor

### Status

| Component                      | Hooks               | Status                      |
| ------------------------------ | ------------------- | --------------------------- |
| username-input.tsx             | useState, useEffect | 🔴 Pending                  |
| board-column.tsx               | useDroppable        | 🔴 Pending                  |
| kanban-task-card.tsx           | useState            | 🔴 Pending                  |
| sortable-task.tsx              | useSortable         | 🔴 Pending                  |
| feature-onboarding.tsx         | useState            | 🔴 Pending                  |
| profile-tabs.tsx               | useState, useEffect | 🔴 Pending                  |
| calendar.tsx                   | useRef, useEffect   | 🔴 Pending                  |
| date-picker.tsx                | useState            | 🔴 Pending                  |
| form.tsx                       | useContext, useId   | 🟡 Partial (form-hooks)     |
| mention-textarea.tsx           | useState            | 🔴 Pending                  |
| sonner.tsx                     | useTheme            | 🟡 Partial (theme-provider) |
| user-profile-card.tsx          | useState            | 🔴 Pending                  |
| invite-member-dialog.tsx       | useState            | 🔴 Pending                  |
| workspace-members-settings.tsx | useState            | 🔴 Pending                  |

### Priority Order

1. **Easy wins** (simple state):
   - kanban-task-card.tsx
   - user-profile-card.tsx
   - invite-member-dialog.tsx

2. **Medium** (complex state):
   - board-column.tsx
   - sortable-task.tsx
   - feature-onboarding.tsx
   - profile-tabs.tsx
   - username-input.tsx

3. **Hard** (framework dependencies):
   - calendar.tsx
   - date-picker.tsx
   - form.tsx
   - sonner.tsx
   - mention-textarea.tsx
   - workspace-members-settings.tsx

## 🎯 Next Steps

1. ✅ Eliminar 'use client' de componentes sin hooks (COMPLETED)
2. 🔧 Refactorizar componentes con hooks (IN PROGRESS)
3. 📝 Crear componentes container en consuming apps
4. 🧪 Validar que todos los componentes funcionan en web, mobile, desktop

---

**Last Updated:** 31 de Diciembre 2025
