# The Content Pipeline

> **VISIÓN — no implementado.** Este documento es una especificación de diseño para una posible variante de Ordo orientada a creadores de contenido. Nada de lo descrito aquí existe en código. Ver el [roadmap](../planning/roadmap.md) para el trabajo real en curso y la [visión de producto](../vision/product-vision.md) (decisión cerrada 1: narrativa única de productividad general).

**ORDO's killer feature: Visual Kanban for content workflow**

## 📋 Table of Contents

1. [Overview](#overview)
2. [The Workflow](#the-workflow)
3. [User Experience](#user-experience)
4. [Technical Implementation](#technical-implementation)
5. [Domain Model](#domain-model)
6. [API Endpoints](#api-endpoints)
7. [UI Components](#ui-components)

---

## 🌊 Overview

The Content Pipeline is ORDO's **core workflow visualization**. It transforms content creation from a chaotic list into a structured, visual pipeline.

### The Problem It Solves

Creators struggle with:

- ❌ **Chaos**: Ideas scattered everywhere
- ❌ **Inconsistency**: No clear workflow
- ❌ **Overwhelm**: Too many ideas = analysis paralysis
- ❌ **Lost Opportunities**: Great ideas never become content

### The Solution

**The Content Pipeline** is a visual Kanban board with 6 fixed stages:

```
┌─────────┬──────────┬─────────┬─────────┬──────────┬──────────┐
│  Ideas  │ Scripting│ Filming │ Editing │ Scheduled│Published │
└─────────┴──────────┴─────────┴─────────┴──────────┴──────────┘
```

**Each stage represents a phase:**

1. **Ideas**: Raw content ideas (from capture, brainstorming)
2. **Scripting**: Writing the script/outline
3. **Filming**: Recording the content
4. **Editing**: Post-production, cuts, effects
5. **Scheduled**: Planned with publish date
6. **Published**: Live on all platforms

---

## 🔄 The Workflow

### 1. Capture (Ideas Column)

**Sources:**

- ✅ Manual entry (web/mobile/desktop)
- ✅ WhatsApp/Telegram bot (frictionless capture)
- ✅ Voice notes (transcribed by AI)
- ✅ Browser extension (quick save)
- ✅ Email to idea

**Flow:**

```
User enters idea → Validates (3-100 chars) → Saves to "Ideas" column
```

### 2. Scripting (Scripting Column)

**What happens:**

- User moves idea to "Scripting"
- System converts Idea → ContentPiece
- Auto-archives original idea

**Features:**

- AI-powered script generation
- Outline templates
- Character/scene tracking (for narrative content)

### 3. Filming (Filming Column)

**What happens:**

- Mark content as "In Production"
- Add shoot notes, location, equipment
- Link to footage (local/cloud)

### 4. Editing (Editing Column)

**What happens:**

- Post-production tracking
- Timeline management
- Collaborative notes (if team)
- Link to editing software files

### 5. Scheduling (Scheduled Column)

**What happens:**

- Set publish date/time
- Select platforms (YouTube, Twitter, LinkedIn, etc.)
- Preview social media posts
- Queue for auto-publish

**Social Preview:**
Shows exactly how content will look on each platform:

```
┌─────────────────────┐
│ 📱 Twitter Preview  │
│                    │
│ [Thumbnail 16:9]   │
│                    │
│ Title (280 chars)    │
│ Hashtags...          │
└─────────────────────┘

┌─────────────────────┐
│ 💼 LinkedIn Preview │
│                    │
│ [Thumbnail 4:5]    │
│                    │
│ Title (3000 chars)  │
│ Description...       │
└─────────────────────┘
```

### 6. Publishing (Published Column)

**What happens:**

- Publishes to selected platforms automatically
- Moves content to "Published" column
- Triggers consistency score update
- **Optional**: Auto-atomizes content (Remix Engine)

---

## 👤 User Experience

### Dashboard View

```
┌─────────────────────────────────────────────────────────────┐
│  ORDOSHIP MORE, MANAGE LESS           🔔  👤 John Doe │
├─────────────────────────────────────────────────────────────┤
│  [Pipeline] [Calendar] [List] [Analytics] [Settings]     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┬──────────┬─────────┬─────────┬──────────┐  │
│  │  Ideas  │ Scripting│ Filming │ Editing │ Scheduled│  │
│  ├─────────┼──────────┼─────────┼─────────┼──────────┤  │
│  │ [+] New │          │         │         │          │  │
│  │         │          │         │         │          │  │
│  │ 📝 AI   │ [Video 1]│         │         │[Vid 2]  │  │
│  │ Content │          │         │         │          │  │
│  │ Ideas   │          │         │         │          │  │
│  │         │          │         │         │          │  │
│  │ [Card]  │          │         │         │          │  │
│  │ [Card]  │          │         │         │          │  │
│  │ [Card]  │          │         │         │          │  │
│  └─────────┴──────────┴─────────┴─────────┴──────────┘  │
│                                                             │
│  📊 Weekly Consistency: 85% (🔥 3-week streak)           │
│  📰 Published this week: 5 pieces                         │
│  💡 Ideas in pipeline: 12                                │
└─────────────────────────────────────────────────────────────┘
```

### Drag & Drop

Users can drag content between columns:

```typescript
// Drag from "Ideas" to "Scripting"
User drags idea → Drop on "Scripting" column
  ↓
System validates: Can move?
  ↓
Yes → Creates ContentPiece, archives Idea
No → Shows error toast ("Idea needs more details")
```

### Keyboard Shortcuts

- `Ctrl/Cmd + N`: New idea
- `Ctrl/Cmd + K`: Quick search
- `1-6`: Switch to column 1-6
- `Arrow keys`: Navigate between cards
- `Enter`: Open selected card
- `Esc`: Close modal

---

## 🔧 Technical Implementation

### Domain Model

```typescript
// packages/core/src/content/entities/content-piece.aggregate.ts
export enum ContentStatus {
  IDEA = "IDEA", // Actually in Ideas column
  SCRIPTING = "SCRIPTING", // Scripting column
  FILMING = "FILMING", // Filming column
  EDITING = "EDITING", // Editing column
  SCHEDULED = "SCHEDULED", // Scheduled column
  PUBLISHED = "PUBLISHED", // Published column
}

export class ContentPiece extends Entity<ContentPieceProps> {
  // Domain behavior: Move to next stage
  moveToNextStage(): ContentPiece {
    const stageOrder = [
      ContentStatus.SCRIPTING,
      ContentStatus.FILMING,
      ContentStatus.EDITING,
      ContentStatus.SCHEDULED,
      ContentStatus.PUBLISHED,
    ];

    const currentIndex = stageOrder.indexOf(this.status);
    if (currentIndex === -1 || currentIndex === stageOrder.length - 1) {
      throw new Error("Cannot move to next stage");
    }

    return this.clone({ status: stageOrder[currentIndex + 1] });
  }

  // Domain behavior: Schedule
  schedule(publishDate: Date, platforms: Platform[]): ContentPiece {
    if (this.status !== ContentStatus.EDITING) {
      throw new Error("Content must be in editing stage before scheduling");
    }

    return this.clone({
      status: ContentStatus.SCHEDULED,
      scheduledAt: publishDate,
      platforms,
    });
  }

  // Domain behavior: Publish
  publish(): ContentPiece {
    if (this.status !== ContentStatus.SCHEDULED) {
      throw new Error("Content must be scheduled before publishing");
    }

    return this.clone({
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
    });
  }
}
```

### Use Cases

```typescript
// packages/core/src/content/use-cases/move-content-pipeline.use-case.ts
export class MoveContentPipelineUseCase implements UseCase<
  MoveContentInput,
  ContentPiece
> {
  constructor(private readonly contentRepo: ContentPieceRepository) {}

  async execute(input: MoveContentInput): Promise<ContentPiece> {
    // Get content
    const content = await this.contentRepo.findById(input.contentId);

    if (!content) {
      throw new Error("Content not found");
    }

    // Verify ownership
    if (content.userId !== input.userId) {
      throw new Error("You do not own this content");
    }

    // Move to next stage (domain validation)
    const moved = content.moveToNextStage();

    // Save
    await this.contentRepo.save(moved);

    return moved;
  }
}
```

---

## 🌐 API Endpoints

### Get Pipeline Data

```http
GET /api/content/pipeline
Authorization: Bearer <token>

Response 200:
{
  "ideas": [
    { "id": "1", "title": "Video idea #1", "createdAt": "..." }
  ],
  "scripting": [
    { "id": "2", "title": "Video #1 script", "status": "SCRIPTING" }
  ],
  "filming": [],
  "editing": [
    { "id": "3", "title": "Video #2 editing", "status": "EDITING" }
  ],
  "scheduled": [
    {
      "id": "4",
      "title": "Video #3",
      "status": "SCHEDULED",
      "scheduledAt": "2025-01-20T10:00:00Z",
      "platforms": ["YouTube", "Twitter", "LinkedIn"]
    }
  ],
  "published": [
    {
      "id": "5",
      "title": "Video #1",
      "status": "PUBLISHED",
      "publishedAt": "2025-01-14T15:00:00Z"
    }
  ]
}
```

### Move Content to Next Stage

```http
PATCH /api/content/:id/move-next
Authorization: Bearer <token>

Response 200:
{
  "id": "2",
  "title": "Video #1 script",
  "status": "FILMING",
  "updatedAt": "..."
}
```

### Schedule Content

```http
POST /api/content/:id/schedule
Authorization: Bearer <token>
Content-Type: application/json

{
  "scheduledAt": "2025-01-20T10:00:00Z",
  "platforms": ["YouTube", "Twitter", "LinkedIn"]
}

Response 200:
{
  "id": "4",
  "title": "Video #3",
  "status": "SCHEDULED",
  "scheduledAt": "2025-01-20T10:00:00Z",
  "platforms": ["YouTube", "Twitter", "LinkedIn"]
}
```

### Publish Content

```http
POST /api/content/:id/publish
Authorization: Bearer <token>

Response 200:
{
  "id": "4",
  "title": "Video #3",
  "status": "PUBLISHED",
  "publishedAt": "2025-01-20T10:00:00Z"
}
```

---

## 🎨 UI Components

### ContentPipeline Component

```typescript
// packages/ui/src/components/content/content-pipeline.tsx
interface ContentPipelineProps {
  ideas: Idea[];
  contentPieces: ContentPiece[];
  onMoveIdea: (id: string) => void;
  onMoveContent: (id: string) => void;
  onSchedule: (id: string, date: Date, platforms: Platform[]) => void;
  onPublish: (id: string) => void;
  labels?: {
    newIdea?: string;
    ideaColumn?: string;
    scriptingColumn?: string;
    filmingColumn?: string;
    editingColumn?: string;
    scheduledColumn?: string;
    publishedColumn?: string;
  };
}

export function ContentPipeline({
  ideas,
  contentPieces,
  onMoveIdea,
  onMoveContent,
  onSchedule,
  onPublish,
  labels = {},
}: ContentPipelineProps) {
  const columns = [
    {
      id: 'ideas',
      title: labels.ideaColumn ?? 'Ideas',
      items: ideas,
      color: 'bg-blue-50',
    },
    {
      id: 'scripting',
      title: labels.scriptingColumn ?? 'Scripting',
      items: contentPieces.filter(c => c.status === ContentStatus.SCRIPTING),
      color: 'bg-yellow-50',
    },
    {
      id: 'filming',
      title: labels.filmingColumn ?? 'Filming',
      items: contentPieces.filter(c => c.status === ContentStatus.FILMING),
      color: 'bg-orange-50',
    },
    {
      id: 'editing',
      title: labels.editingColumn ?? 'Editing',
      items: contentPieces.filter(c => c.status === ContentStatus.EDITING),
      color: 'bg-purple-50',
    },
    {
      id: 'scheduled',
      title: labels.scheduledColumn ?? 'Scheduled',
      items: contentPieces.filter(c => c.status === ContentStatus.SCHEDULED),
      color: 'bg-green-50',
    },
    {
      id: 'published',
      title: labels.publishedColumn ?? 'Published',
      items: contentPieces.filter(c => c.status === ContentStatus.PUBLISHED),
      color: 'bg-gray-50',
    },
  ];

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map(column => (
        <PipelineColumn
          key={column.id}
          title={column.title}
          items={column.items}
          color={column.color}
          onMove={onMoveContent}
          onSchedule={onSchedule}
          onPublish={onPublish}
        />
      ))}
    </div>
  );
}
```

### Usage in Web App

```typescript
// apps/web/src/app/dashboard/pipeline/page.tsx
'use client';

import { ContentPipeline } from '@ordo-todo/ui';
import { useIdeas, useContentPieces, useMoveContentPipeline } from '@/lib/api-hooks';

export default function PipelinePage() {
  const { data: ideas } = useIdeas();
  const { data: contentPieces } = useContentPieces();
  const moveContent = useMoveContentPipeline();

  const handleMoveContent = async (id: string) => {
    await moveContent.mutateAsync(id);
  };

  return (
    <ContentPipeline
      ideas={ideas || []}
      contentPieces={contentPieces || []}
      onMoveIdea={handleMoveIdea}
      onMoveContent={handleMoveContent}
      onSchedule={handleSchedule}
      onPublish={handlePublish}
      labels={{
        newIdea: 'New Idea',
        ideaColumn: 'Ideas',
        scriptingColumn: 'Scripting',
        filmingColumn: 'Filming',
        editingColumn: 'Editing',
        scheduledColumn: 'Scheduled',
        publishedColumn: 'Published',
      }}
    />
  );
}
```

---

## 🎯 Benefits

### For Creators

1. **Visual Clarity**: See exactly where each piece of content is
2. **Structured Workflow**: No more chaos, just follow the pipeline
3. **Focus**: Know what to work on next
4. **Consistency**: Pipeline enforces regular publishing
5. **Automation**: Scheduled content publishes automatically

### For Teams

1. **Collaboration**: See team progress at a glance
2. **Handoffs**: Clear stages for team handoffs
3. **Accountability**: Who's working on what
4. **Planning**: Schedule content weeks in advance

---

## 📚 Related Features

> Los siguientes documentos están pendientes de redactar (no existen aún como ficheros; no se crean en esta limpieza):

- Frictionless Capture — Add ideas quickly *(pendiente)*
- Social Previews — Preview posts before publishing *(pendiente)*
- Consistency Score — Track publishing consistency *(pendiente)*
- Remix Engine — Atomize published content *(pendiente)*
- AI Copilot — AI assistance for each stage *(pendiente)*

---

**Built for creators who want to ship more, manage less. 🚀**
