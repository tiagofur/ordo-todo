# Web Development Guide

**Building the Next.js 16 web app for ORDO**

## 📋 Table of Contents

1. [Project Structure](#project-structure)
2. [App Router](#app-router)
3. [Server Components](#server-components)
4. [Client Components](#client-components)
5. [Data Fetching](#data-fetching)
6. [State Management](#state-management)
7. [Styling](#styling)
8. [Routing](#routing)
9. [Internationalization](#internationalization)

---

## 📁 Project Structure

```
apps/web/
├── app/                          # App Router (Next.js 15+)
│   ├── (auth)/                   # Auth routes group
│   │   ├── login/
│   │   │   └── page.tsx         # /login
│   │   ├── register/
│   │   │   └── page.tsx         # /register
│   │   └── layout.tsx           # Auth layout
│   ├── (dashboard)/              # Dashboard routes group
│   │   ├── layout.tsx           # Dashboard layout (sidebar, header)
│   │   ├── page.tsx             # /dashboard
│   │   ├── tasks/
│   │   │   ├── page.tsx         # /dashboard/tasks
│   │   │   └── [id]/
│   │   │       └── page.tsx     # /dashboard/tasks/[id]
│   │   ├── projects/
│   │   │   └── [id]/
│   │   │       └── page.tsx     # /dashboard/projects/[id]
│   │   └── settings/
│   │       └── page.tsx         # /dashboard/settings
│   ├── api/                     # Route handlers (if needed)
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
│
├── components/                  # Web-specific components
│   ├── providers/              # Context providers
│   │   ├── auth-provider.tsx
│   │   ├── query-provider.tsx
│   │   └── theme-provider.tsx
│   ├── dashboard/             # Dashboard-specific
│   │   ├── sidebar.tsx
│   │   └── header.tsx
│   └── [feature]/             # Feature-specific containers
│       └── task-list-container.tsx
│
├── lib/                       # Web-specific utilities
│   ├── api-client.ts          # Axios configuration
│   ├── api-hooks.ts           # React Query hooks (from packages/hooks)
│   ├── utils.ts               # Helper functions
│   └── constants.ts           # App constants
│
├── styles/                    # Global styles
│   └── globals.css
│
├── public/                    # Static assets
│
├── next.config.js             # Next.js config
├── tailwind.config.js         # Tailwind config (extends from packages/styles)
├── tsconfig.json              # TypeScript config
└── package.json
```

---

## 🚀 App Router

Next.js 16 uses App Router with Server Components by default.

### Route Groups

```typescript
// app/(auth)/login/page.tsx
// Route: /login
export default function LoginPage() {
  return <LoginForm />;
}

// app/(dashboard)/tasks/page.tsx
// Route: /dashboard/tasks
export default function TasksPage() {
  return <TaskList />;
}
```

### Dynamic Routes

```typescript
// app/dashboard/tasks/[id]/page.tsx
export default function TaskPage({ params }: { params: { id: string } }) {
  return <TaskDetails id={params.id} />;
}
```

---

## 🖥️ Server Components

Server Components render on the server by default. Use them for:

- Data fetching (direct access to database/API)
- Static content
- SEO-critical pages

### Example: Server Component

```typescript
// app/dashboard/page.tsx
import { packageApiClient } from '@/lib/package-api-client';

export default async function DashboardPage() {
  // Direct data fetching on server
  const tasks = await packageApiClient.getTasks();

  return (
    <div>
      <h1>Dashboard</h1>
      <ul>
        {tasks.map(task => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Server Actions

```typescript
// app/actions/tasks.ts
"use server";

import { revalidatePath } from "next/cache";
import { packageApiClient } from "@/lib/package-api-client";

export async function createTaskAction(formData: FormData) {
  const title = formData.get("title") as string;

  if (!title || title.length < 3) {
    return { error: "Title must be at least 3 characters" };
  }

  const task = await packageApiClient.createTask({ title });

  // Revalidate cache
  revalidatePath("/dashboard/tasks");

  return { success: true, task };
}
```

---

## 🖥️ Client Components

Client Components render on the client. Use them for:

- Interactivity (clicks, forms, state)
- Browser APIs (window, localStorage)
- Hooks (useState, useEffect, React Query)

### Example: Client Component

```typescript
// components/task-list-container.tsx
'use client';

import { useTasks, useCreateTask } from '@/lib/api-hooks';
import { Button } from '@ordo-todo/ui';
import { useState } from 'react';

export function TaskListContainer() {
  const { data: tasks, isLoading, error } = useTasks();
  const createTask = useCreateTask();
  const [newTitle, setNewTitle] = useState('');

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <form onSubmit={(e) => {
        e.preventDefault();
        createTask.mutate({ title: newTitle });
        setNewTitle('');
      }}>
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New task..."
        />
        <Button type="submit">Create</Button>
      </form>

      <ul>
        {tasks?.map(task => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 📡 Data Fetching

### Using Shared Hooks

```typescript
// lib/api-hooks.ts
import { createHooks } from "@ordo-todo/hooks";
import { packageApiClient as apiClient } from "./package-api-client";

// One factory call; destructure the hooks the app needs.
export const { useTasks, useCreateTask, useUpdateTask, useDeleteTask } =
  createHooks({ apiClient });
```

### Using in Components

```typescript
'use client';

import { useTasks, useCreateTask } from '@/lib/api-hooks';

export function TaskList() {
  const { data: tasks, isLoading } = useTasks();
  const createTask = useCreateTask();

  return <div>{/* render tasks */}</div>;
}
```

### Server-Side Data Fetching

```typescript
// app/dashboard/tasks/page.tsx
import { packageApiClient } from '@/lib/package-api-client';

export default async function TasksPage() {
  // Server-side fetch
  const tasks = await packageApiClient.getTasks();

  return (
    <div>
      {tasks.map(task => (
        <div key={task.id}>{task.title}</div>
      ))}
    </div>
  );
}
```

---

## 📊 State Management

### Server State (React Query)

Use shared hooks from `packages/hooks`:

```typescript
'use client';

import { useTasks, useCreateTask } from '@/lib/api-hooks';

export function TaskList() {
  const { data: tasks, isLoading, error } = useTasks();
  const createTask = useCreateTask();

  return <div>{/* ... */}</div>;
}
```

### Client State (Zustand)

Use shared stores from `packages/stores`:

```typescript
'use client';

import { useUIStore, useContentStore } from '@ordo-todo/stores';

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { viewMode, setViewMode } = useContentStore();

  return (
    <aside className={sidebarCollapsed ? 'w-16' : 'w-64'}>
      <button onClick={toggleSidebar}>Toggle</button>
      <select
        value={viewMode}
        onChange={(e) => setViewMode(e.target.value as any)}
      >
        <option value="pipeline">Pipeline</option>
        <option value="list">List</option>
      </select>
    </aside>
  );
}
```

---

## 🎨 Styling

### Using Shared UI Components

```typescript
import { Button, Card, CardHeader, CardTitle, CardContent, Input } from '@ordo-todo/ui';

export function Dashboard() {
  return (
    <div>
      <Button variant="default">Primary Button</Button>
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
        </CardHeader>
        <CardContent>Card content</CardContent>
      </Card>
      <Input placeholder="Search tasks..." />
    </div>
  );
}
```

### Tailwind Classes

```typescript
// Responsive classes
<div className="
  grid
  grid-cols-1          /* Mobile: 320px - 640px */
  md:grid-cols-2       /* Tablet: 641px - 1024px */
  lg:grid-cols-3       /* Desktop: 1025px+ */
  gap-4
">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>

// Dark mode
<div className="
  bg-white dark:bg-gray-900
  text-gray-900 dark:text-gray-100
  border-gray-200 dark:border-gray-700
">
  Content
</div>
```

### No Transparencies & Gradients

```typescript
// ✅ CORRECT: Solid colors
<div className="bg-white dark:bg-gray-900">
  <Button className="bg-blue-500 hover:bg-blue-600">
    Click me
  </Button>
</div>

// ❌ WRONG: Transparencies
<div className="bg-white/80 dark:bg-gray-900/90">
  <Button className="bg-blue-500/90">
```

```typescript
// ✅ CORRECT: Solid color
<div className="bg-blue-500 text-white">Button</div>

// ❌ WRONG: Gradient
<div className="bg-gradient-to-r from-blue-500 to-purple-500">
```

---

## 🧭 Routing

### Using Next.js Router

```typescript
'use client';

import { useRouter } from 'next/navigation';

export function TaskCard({ task }: { task: { id: string; title: string } }) {
  const router = useRouter();

  return (
    <Card onClick={() => router.push(`/dashboard/tasks/${task.id}`)}>
      <h3>{task.title}</h3>
    </Card>
  );
}
```

### Link Component

```typescript
import Link from 'next/link';

export function Navigation() {
  return (
    <nav>
      <Link href="/dashboard/tasks">Tasks</Link>
      <Link href="/dashboard/projects">Projects</Link>
      <Link href="/dashboard/settings">Settings</Link>
    </nav>
  );
}
```

### Active Links

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={isActive ? 'text-blue-500 font-bold' : 'text-gray-700'}
    >
      {children}
    </Link>
  );
}
```

---

## 🌐 Internationalization

### Using next-intl

```typescript
'use client';

import { useTranslations } from 'next-intl';

export function TaskForm() {
  const t = useTranslations('CreateTask');

  return (
    <form>
      <h2>{t('create')}</h2>
      <input placeholder={t('titlePlaceholder')} />
      <button type="submit">{t('submit')}</button>
    </form>
  );
}
```

### Passing i18n to Shared Components

```typescript
'use client';

import { useTranslations } from 'next-intl';

export function TaskList() {
  const t = useTranslations('Tasks');

  return (
    <ul>
      {tasks.map(task => (
        <li key={task.id} onClick={() => handleClick(task.id)}>
          {task.title} ({t('open')})
        </li>
      ))}
    </ul>
  );
}
```

---

## 🧪 Testing

### Component Testing with React Testing Library

```typescript
// components/__tests__/task-list-container.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskListContainer } from '../task-list-container';

describe('TaskListContainer', () => {
  it('renders tasks', () => {
    render(<TaskListContainer />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('creates new task', async () => {
    render(<TaskListContainer />);

    const input = screen.getByPlaceholderText('New task...');
    const button = screen.getByText('Create');

    fireEvent.change(input, { target: { value: 'Test Task' } });
    fireEvent.click(button);

    // Wait for mutation to complete
    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });
  });
});
```

### E2E Testing with Playwright

```typescript
// e2e/tasks.spec.ts
import { test, expect } from "@playwright/test";

test("should create task", async ({ page }) => {
  await page.goto("/dashboard/tasks");

  await page.fill('input[placeholder="New task..."]', "E2E Test Task");
  await page.click('button:has-text("Create")');

  await expect(page.locator("text=E2E Test Task")).toBeVisible();
});

test("should navigate to task details", async ({ page }) => {
  await page.goto("/dashboard/tasks");

  await page.click("text=Test Task");

  await expect(page).toHaveURL(/\/dashboard\/tasks\/.*/);
  await expect(page.locator("h1")).toContainText("Test Task");
});
```

---

## 🎯 Best Practices

### ✅ DO

1. **Use Server Components by default**
2. **Import from shared packages** (`@ordo-todo/ui`, `@ordo-todo/hooks`)
3. **Use dark mode classes** (`dark:bg-gray-900`)
4. **Perfect responsiveness** (mobile, tablet, desktop)
5. **Test components** (unit + E2E)
6. **Use i18n** for all user-facing text

### ❌ DON'T

1. **Use transparencies** (`bg-white/80`)
2. **Use gradients** (`bg-gradient-to-r`)
3. **Skip accessibility** (ARIA labels, keyboard navigation)
4. **Use `any` type** (use proper TypeScript types)
5. **Ignore mobile** (must work on 320px - 640px)

---

## 📚 Further Reading

- [Architecture Overview](../architecture/overview.md)
- [UI Components Guide](../packages/ui-components.md)
- [Testing Strategy](../best-practices/testing-strategy.md)
- [Performance Optimization](../best-practices/performance-optimization.md)
