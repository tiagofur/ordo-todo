# Product Requirements Document (PRD)

## Ordo-Todo: The Modern Task Organization Platform

**Version**: 2.0
**Last Updated**: March 30, 2026
**Status**: Production (Web), Beta (Mobile, Desktop)

---

## 1. Vision & Overview

### 1.1 Product Vision

Ordo-Todo is a next-generation task management application that combines simplicity, elegance, and technological power. Our goal is to create the definitive productivity tool that helps people organize their professional and personal lives without overwhelming them with unnecessary complexity.

### 1.2 Value Proposition

| Pillar | Description |
|--------|-------------|
| **Intelligent Simplicity** | Powerful functionality with a minimalist interface |
| **AI as Copilot** | Smart assistant that helps without interrupting |
| **Flexibility without Complexity** | Adaptable to different workflows without overwhelming configuration |
| **True Cross-Platform** | Native experience on web, mobile, and desktop |
| **Wellbeing-Aware** | Burnout detection, energy matching, and work-life balance |

### 1.3 Target Audience

- **Primary**: Professionals managing multiple projects (25-45 years)
- **Secondary**: Small and medium teams (2-20 people)
- **Tertiary**: Students, academics, freelancers, and entrepreneurs
- **Niche**: People seeking work-life balance with intelligent tooling

### 1.4 Competitive Positioning

| vs Competitor | Ordo-Todo Advantage |
|---------------|---------------------|
| **Todoist** | Native integrated timer, AI-powered scheduling, energy matching, wellbeing tracking |
| **Notion** | Task-focused (not all-in-one), faster and lighter, superior mobile experience |
| **ClickUp** | Not overwhelming, smooth learning curve, cleaner design |
| **Asana** | More accessible pricing, AI included in all plans, focus & timer features |
| **Ticktick** | Deeper AI integration, OKR/goals system, team collaboration, custom fields |

---

## 2. Platform Architecture

### 2.1 Technology Stack (Current)

| Layer | Technology | Version |
|-------|-----------|---------|
| **Web Frontend** | Next.js (App Router) | 16.1.1 |
| **UI Framework** | React | 19.2.3 |
| **Mobile** | React Native + Expo | SDK 52+ |
| **Desktop** | Electron + Vite | Latest |
| **Backend API** | NestJS (REST) | 11.1.11 |
| **Database** | PostgreSQL + Prisma ORM | 16 / 7.x |
| **Cache** | Redis (Upstash) | - |
| **Language** | TypeScript | 5.9.3 |
| **Styling** | Tailwind CSS | 4.1.17 |
| **State (Server)** | TanStack React Query | 5.90+ |
| **State (Client)** | Zustand | 5.0.9 |
| **AI Provider** | Google Gemini API | Latest |
| **Auth** | NextAuth.js + JWT | 4.24+ |
| **i18n** | next-intl | 4.5+ |
| **Animation** | Framer Motion | 12.x |
| **Icons** | Lucide React + Tabler Icons | Latest |
| **Forms** | React Hook Form + Zod | 7.x / 4.x |

### 2.2 Monorepo Structure

```
ordo-todo/ (Turborepo)
├── apps/
│   ├── web/          Next.js 16 (PWA-ready)
│   ├── backend/      NestJS REST API (34 modules, 200+ endpoints)
│   ├── mobile/       React Native + Expo
│   └── desktop/      Electron + Vite + React
│
└── packages/
    ├── core/         Domain entities, use cases (38 domain modules)
    ├── db/           Prisma schema (40+ models)
    ├── ui/           88 shared React components
    ├── hooks/        100+ React Query hooks (factory pattern)
    ├── stores/       4 Zustand stores
    ├── api-client/   181 typed API endpoint methods
    ├── i18n/         3 languages (en, es, pt-br)
    ├── styles/       Design tokens (CSS + JS)
    ├── config/       Shared defaults & constants
    ├── validations/  Shared Zod schemas
    ├── eslint-config/
    └── typescript-config/
```

### 2.3 Synchronization

- Real-time sync between devices via REST polling + WebSockets (Socket.IO)
- Offline mode with IndexedDB persistence and automatic sync
- Conflict resolution for concurrent edits
- Optimistic updates for instant UI feedback

---

## 3. Information Architecture

### 3.1 Organization Hierarchy

```
User
├── Workspaces (PERSONAL | WORK | TEAM)
│   ├── Workflows (custom status columns)
│   │   └── Projects
│   │       └── Tasks
│   │           ├── Subtasks
│   │           ├── Comments
│   │           ├── Attachments
│   │           ├── Custom Fields
│   │           ├── Tags (many-to-many)
│   │           ├── Dependencies (blocking/blocked)
│   │           ├── Time Sessions
│   │           └── Recurrence rules
│   ├── Notes (sticky board)
│   └── Members (OWNER | ADMIN | MEMBER | VIEWER)
│
├── Habits (daily/weekly tracking)
├── Objectives (OKR: Objectives → Key Results → linked Tasks)
├── AI Profile (preferences, learning data)
├── Notifications
└── Analytics (DailyMetrics, streaks, heatmaps)
```

### 3.2 Task Structure

**Core Fields:**
- Title (required, 1-200 chars)
- Project (required)
- Description (Markdown, max 5000 chars)
- Due date, Start date, Scheduled date/time
- Priority: LOW | MEDIUM | HIGH | URGENT
- Status: TODO | IN_PROGRESS | COMPLETED | CANCELLED
- Estimated minutes (1-480)
- Tags (workspace-scoped)
- Assignee (team workspaces)

**Advanced Fields:**
- Dependencies (blocking/blocked by relationships)
- Recurrence (DAILY | WEEKLY | MONTHLY | YEARLY | CUSTOM)
- Time blocks (calendar integration)
- Custom fields (per-project, dynamic)
- Attachments (max 10MB, common formats)
- Public share token (read-only link)

---

## 4. Core Features

### 4.1 Task Management

#### Quick Creation
- Quick-add from any screen (`N` / `Cmd/Ctrl+N`), command palette on `Cmd/Ctrl+K` (see `docs/guides/shortcuts.md`)
- Natural language parsing via AI ("Meeting with client tomorrow 3pm #work @high")
- AI extracts: date, time, tags, priority, project

#### Views
| View | Description | Status |
|------|-------------|--------|
| **List** | Default view with grouping, filters, drag & drop | ✅ Implemented |
| **Kanban Board** | Customizable columns per workflow | ✅ Implemented |
| **Calendar** | Monthly/weekly with time-blocking | ✅ Implemented |
| **Timeline (Gantt)** | Project dependencies visualization | ✅ Implemented |
| **Eisenhower Matrix** | Urgency vs Importance quadrants | ✅ Implemented |
| **Focus Mode** | Single task view, distraction-free | ✅ Implemented |
| **Today View** | Overdue + due today + scheduled + available | ✅ Implemented |

#### Task Filters
- By status, priority, tags, assignee, project
- Date ranges (today, this week, this month, overdue)
- Combined filters with AND logic
- Quick filter bar on task views
- Batch actions (bulk complete, delete, move)

### 4.2 Time Tracking System

#### Timer Modes
| Mode | Description |
|------|-------------|
| **Pomodoro** | Work 25min → Short break 5min → Long break 15min (every 4 pomodoros) |
| **Continuous** | Unlimited timer with manual pauses |

All durations configurable. Timer persists across navigation.

#### Timer Features
- Start/stop/pause/resume
- Task switching without stopping (seamless transition)
- Session history with statistics
- Auto-tracking to DailyMetrics on session completion
- Focus score calculation: `(workTime / totalTime) - (pauseCount * 0.02)`
- Widget visible in sidebar and dashboard
- Ambient audio player in Focus mode

### 4.3 Workspace & Collaboration

#### Workspace Types
| Type | Use Case |
|------|----------|
| **PERSONAL** | Private tasks, personal goals, hobbies |
| **WORK** | Professional individual tasks |
| **TEAM** | Shared collaboration with members |

#### Role-Based Access Control
| Role | Capabilities |
|------|-------------|
| **OWNER** | Full control, can delete workspace |
| **ADMIN** | Manage members, settings, moderate content |
| **MEMBER** | Create/edit content, invite members |
| **VIEWER** | Read-only access |

#### Collaboration Features
- Member invitation via email (7-day expiry tokens)
- Workspace audit logs (activity tracking)
- Workload analysis per member
- Workspace-scoped settings (default views, sorts, notifications)

### 4.4 Habits Tracking

- Daily/weekly habit definitions with frequency targets
- Completion tracking with streak counting
- Statistics: completion rate, current/best streak
- Pause/resume for temporary breaks
- Dashboard widget with progress rings
- Celebration animations on completions

### 4.5 Objectives & Key Results (OKR)

- Create Objectives with time periods
- Define measurable Key Results per Objective
- Link Tasks to Key Results (progress auto-calculated)
- Dashboard summary with overall progress
- Current period view for active OKRs
- Visual progress indicators

### 4.6 Notes Board

- Sticky notes on a spatial canvas
- Workspace-scoped
- Color-coded notes
- Drag positioning (x, y coordinates)
- Resizable notes
- Search and filter

### 4.7 Search

| Type | Description |
|------|-------------|
| **Quick Search** | Fast autocomplete across all entities |
| **Semantic Search** | AI-powered search understanding intent |
| **Suggestions** | Auto-complete based on recent activity |
| **Natural Language Q&A** | Ask questions about your data |

---

## 5. AI Features

### 5.1 Ordo AI Assistant

| Feature | Description | Status |
|---------|-------------|--------|
| **Chat** | Multi-turn conversational AI assistant | ✅ |
| **Task Parsing** | Natural language → structured task | ✅ |
| **Task Decomposition** | Break complex tasks into subtasks | ✅ |
| **Workflow Suggestions** | Recommend workflows for projects | ✅ |
| **Smart Scheduling** | Optimal task ordering based on patterns | ✅ |
| **Duration Prediction** | Estimate task time from historical data | ✅ |

### 5.2 Reports & Insights

| Report | Description |
|--------|-------------|
| **Weekly Report** | AI-generated weekly productivity summary |
| **Monthly Report** | Monthly trends and achievements |
| **Project Report** | Per-project metrics and health analysis |
| **Productivity Insights** | Pattern detection and actionable advice |

### 5.3 Wellbeing & Burnout Prevention

| Feature | Description |
|---------|-------------|
| **Wellbeing Indicators** | Overall health metrics based on work patterns |
| **Burnout Analysis** | Risk assessment based on hours, breaks, streaks |
| **Work Patterns** | Visualization of work distribution |
| **Rest Recommendations** | AI-suggested break times and activities |
| **Burnout Intervention** | Proactive alerts when risk is high |
| **Weekly Wellbeing Summary** | Holistic weekly health overview |

### 5.4 AI Profile

- Personalized AI behavior based on user preferences
- Learning from corrections and feedback
- Configurable AI features (enable/disable per user)
- Data sharing preferences for AI training

---

## 6. Analytics & Metrics

### 6.1 Dashboard Metrics

| Metric | Description |
|--------|-------------|
| **Tasks completed** | Today, this week, this month |
| **Productivity streak** | Consecutive productive days |
| **Time worked** | Total from timer sessions |
| **Pomodoros completed** | Count of completed work sessions |
| **Focus score** | Work efficiency (0-100%) |
| **Task completion rate** | Completed vs created |

### 6.2 Visualizations

| Chart | Description |
|-------|-------------|
| **Weekly Activity** | Bar chart of last 7 days |
| **Heatmap** | Calendar heatmap of productivity |
| **Focus Score Gauge** | Circular gauge with color coding |
| **Peak Hours** | When user is most productive |
| **Distribution** | Tasks by project, status, priority |
| **Project Time** | Time spent per project |

### 6.3 Analytics Endpoints

- Daily metrics (single day or date range)
- Weekly aggregation
- Monthly aggregation
- Custom date range
- Team metrics (per workspace)
- Dashboard stats (quick overview)

---

## 7. Authentication & Security

### 7.1 Authentication Methods

| Method | Status |
|--------|--------|
| Email + Password (bcrypt) | ✅ |
| Google OAuth 2.0 | ✅ |
| GitHub OAuth | ✅ |
| JWT (httpOnly cookies) | ✅ |
| Token refresh rotation | ✅ |
| CSRF protection | ✅ |

### 7.2 Security Features

- JWT access tokens (24h) + refresh tokens (7d)
- Token blacklisting via Redis on logout
- Rate limiting (login: 5/min, register: 3/hour)
- Input validation on all endpoints (class-validator)
- Workspace-scoped authorization checks
- File upload validation (type, size, filename sanitization)
- Security headers (X-Frame-Options, X-Content-Type-Options)
- Soft deletes for data recovery
- Audit logging for workspace actions

### 7.3 Privacy & Compliance

- GDPR: Data export, account deletion, consent management
- Data portability: JSON/CSV export
- User preferences for AI data sharing
- Account deletion with 30-day grace period

---

## 8. Internationalization

### 8.1 Supported Languages

| Language | Code | Status |
|----------|------|--------|
| English | en | ✅ Complete |
| Spanish | es | ✅ Complete (default) |
| Portuguese (Brazil) | pt-br | ✅ Complete |

### 8.2 Implementation

- Framework: next-intl (web), i18next (mobile/desktop)
- Locale detection from URL path (`/[locale]/...`)
- Shared translation files in `packages/i18n`
- Format conversion utilities between next-intl and i18next syntaxes
- Localized dates and numbers via Intl API

---

## 9. PWA & Offline

### 9.1 PWA Features

- Installable on mobile and desktop (standalone display)
- Service worker for offline fallback
- App shortcuts: "New Task", "Quick Timer"
- Push notifications (configurable)
- Theme color: `#4F46E5` (Indigo)

### 9.2 Offline Capabilities

- IndexedDB storage for offline data persistence
- Sync status indicator (idle, syncing, error, offline)
- Pending actions queue for when connection restores
- Conflict resolution for concurrent edits

---

## 10. Public Content & Community

### 10.1 Content Modules

| Module | Endpoints | Purpose |
|--------|-----------|---------|
| **Blog** | CRUD posts, comments | Company blog |
| **Changelog** | List entries | Version history |
| **Roadmap** | List items + voting | Feature requests |
| **Newsletter** | Subscribe | Email list |
| **Contact** | Submit form | User contact |
| **Knowledge Base** | Articles + categories | Self-service help |
| **FAQ** | List entries | Common questions |

---

## 11. Pricing Model

### 11.1 Tiers

| Tier | Price | Key Features |
|------|-------|-------------|
| **Free** | $0 | 1 workspace, 50 active tasks, basic AI, 100MB storage, 2 devices |
| **Pro** | $9/mo | Unlimited workspaces & tasks, full AI, 10GB storage, all devices, integrations |
| **Team** | $12/user/mo | Everything in Pro + shared workspaces, real-time collaboration, roles, team analytics, SSO |
| **Enterprise** | Custom | Everything in Team + self-hosted, SLA, 24/7 support, custom integrations, data residency |

---

## 12. API Surface

### 12.1 Backend Modules (34 Active)

**Foundation**: Health, Metrics, Auth, Images, Users, Workspaces
**Core Tasks**: Workflows, Projects, Tasks, Notes, Tags, Timers
**Advanced**: Analytics, AI, Chat, Comments, Attachments, Upload, Notifications, Gamification, Templates, Collaboration, Habits, Objectives, CustomFields, Focus, Meetings, Search
**Public Content**: Blog, Changelog, Newsletter, Contact, Roadmap

### 12.2 Endpoint Summary

| Domain | Endpoints | Key Operations |
|--------|-----------|---------------|
| Auth | 10 | Register, login, logout, refresh, OAuth (Google, GitHub) |
| Users | 11 | Profile CRUD, preferences, avatar, data export, account deletion |
| Workspaces | 20+ | CRUD, members, invitations, settings, audit logs, archive |
| Projects | 12 | CRUD, archive, complete, trash/restore, slug lookup |
| Tasks | 25+ | CRUD, today/scheduled/available views, subtasks, deps, share, time-blocks |
| Tags | 6 | CRUD, assign/remove from tasks |
| Timers | 10 | Start/stop/pause/resume, switch task, history, stats |
| Analytics | 10 | Daily/weekly/monthly, heatmap, distributions, streaks, team |
| AI | 20+ | Chat, parse, decompose, schedule, predict, wellbeing, reports |
| Habits | 10 | CRUD, complete/uncomplete, pause/resume, stats |
| Objectives | 12 | CRUD objectives & key results, link/unlink tasks |
| Comments | 4 | CRUD on tasks |
| Attachments | 5 | Upload, CRUD, project files |
| Notifications | 4 | List, unread count, mark read |
| Search | 4 | Semantic, suggestions, Q&A, quick |
| Notes | 5 | CRUD workspace notes |
| **Total** | **200+** | |

---

## 13. Quality Metrics (Current)

| Metric | Value |
|--------|-------|
| TypeScript errors | 0 |
| Tests passing | 526/633 (83%) |
| Build status | ✅ All packages |
| npm vulnerabilities | 0 |
| Backend modules | 34/34 active |
| REST endpoints | 200+ |
| UI components (shared) | 88 |
| React Query hooks | 100+ |
| API client methods | 181 |
| Supported languages | 3 |

---

## 14. KPIs & Success Metrics

### Product
- **DAU/MAU ratio**: > 40% (stickiness)
- **Retention D7**: > 60%
- **Retention D30**: > 40%
- **Activation rate**: > 70% (complete onboarding)
- **Time to first task**: < 2 minutes

### Business
- **Free-to-paid conversion**: > 5%
- **Monthly churn**: < 3%
- **NPS**: > 50

### Engagement
- **Tasks created/user/day**: > 5
- **Tasks completed/user/day**: > 3
- **Sessions/user/day**: > 2
- **AI usage**: > 30% of users/week

---

## 15. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| AI costs limit profitability | Medium | High | Aggressive caching, Gemini (cost-effective) |
| Saturated market | High | Medium | Clear differentiation (AI + wellbeing + timer) |
| Sync issues | Medium | High | Exhaustive testing, offline-first architecture |
| Slow adoption | Medium | High | Generous free tier, product-led growth |
| Competitor copies features | High | Medium | Continuous innovation, strong brand |

---

**This is a living document. Updated quarterly based on market learnings, user feedback, and technological evolution.**
