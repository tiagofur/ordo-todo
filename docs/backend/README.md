# Ordo-Todo Backend API Documentation

Complete API reference for the Ordo-Todo backend REST API.

## Documentation

- **[README.md](./README.md)** - API endpoints reference (this file)
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and module structure
- **[SECURITY.md](./SECURITY.md)** - Security implementation details
- **[IMPROVEMENTS.md](./IMPROVEMENTS.md)** - Planned enhancements roadmap
- **[ai-features.md](./ai-features.md)** - AI capabilities and cost optimization
- **[AUDITORIA-2025-01-02.md](./AUDITORIA-2025-01-02.md)** - Complete quality audit (January 2025) - Clean Code, SOLID, Testing, Type Safety
- **[AUDITORIA-COMPLETA.md](./AUDITORIA-COMPLETA.md)** - Previous comprehensive audit (December 2025)
- **[AUDITORIA-RESUMEN-FINAL.md](./AUDITORIA-RESUMEN-FINAL.md)** - Final audit summary and metrics

## Quick Start

**Base URL**: `http://localhost:3101/api/v1`

**Authentication**: All endpoints (except public auth routes) require JWT Bearer token.

```bash
# Login to get token
curl -X POST /auth/login -d '{"email":"user@example.com","password":"..."}'

# Use token in requests
curl -H "Authorization: Bearer <token>" /users/me
```

## Endpoints Overview

| Module                          | Base Path        | Description                          |
| ------------------------------- | ---------------- | ------------------------------------ |
| [Auth](#auth)                   | `/auth`          | Register, login, logout              |
| [Users](#users)                 | `/users`         | Profile, preferences                 |
| [Workspaces](#workspaces)       | `/workspaces`    | Workspace CRUD, members, invitations |
| [Projects](#projects)           | `/projects`      | Project CRUD                         |
| [Tasks](#tasks)                 | `/tasks`         | Task CRUD, subtasks, dependencies    |
| [Timer](#timer)                 | `/timers`        | Pomodoro/continuous timer            |
| [Analytics](#analytics)         | `/analytics`     | Metrics, heatmap, team reports       |
| [AI](#ai)                       | `/ai`            | Chat, reports, wellbeing             |
| [Tags](#tags)                   | `/tags`          | Tag management                       |
| [Comments](#comments)           | `/comments`      | Task comments                        |
| [Notifications](#notifications) | `/notifications` | User notifications                   |

---

## Auth

### `POST /auth/register`

Create a new user account.

**Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "User Name"
}
```

### `POST /auth/login`

Login and get JWT token.

**Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "...", "email": "...", "name": "..." }
}
```

### `POST /auth/logout`

Invalidate current session.

---

## Users

### `GET /users/me`

Get current user info.

### `GET /users/me/profile`

Get complete user profile with preferences.

### `PUT /users/me`

Update user profile.

### `GET /users/me/preferences`

Get user preferences (timer settings, AI, etc.)

### `PATCH /users/me/preferences`

Update preferences.

---

## Workspaces

### `GET /workspaces`

List user's workspaces.

### `POST /workspaces`

Create workspace.

### `GET /workspaces/:id`

Get workspace details.

### `PUT /workspaces/:id`

Update workspace.

### `DELETE /workspaces/:id`

Delete workspace.

### Members & Invitations

- `GET /workspaces/:id/members` - List members
- `POST /workspaces/:id/invite` - Send invitation
- `GET /workspaces/:id/invitations` - List pending invitations
- `POST /workspaces/invitations/accept` - Accept invitation

---

## Projects

### `GET /projects?workspaceId=...`

List projects in workspace.

### `POST /projects`

Create project.

### `GET /projects/:id`

Get project details.

### `PUT /projects/:id`

Update project.

### `PATCH /projects/:id/complete`

Mark project as completed.

### `DELETE /projects/:id`

Delete project.

---

## Tasks

### `GET /tasks?projectId=...&tags=...&assignedToMe=true`

List tasks with filters.

### `POST /tasks`

Create task.

**Body:**

```json
{
  "title": "Task title",
  "projectId": "...",
  "description": "Optional description",
  "priority": "MEDIUM",
  "dueDate": "2024-12-15T10:00:00Z",
  "estimatedMinutes": 60
}
```

### `GET /tasks/:id`

Get task.

### `GET /tasks/:id/details`

Get task with subtasks, comments, attachments.

### `PUT /tasks/:id`

Update task.

### `PATCH /tasks/:id/complete`

Complete task.

### `DELETE /tasks/:id`

Delete task.

### Subtasks

- `POST /tasks/:id/subtasks` - Create subtask

### Dependencies

- `GET /tasks/:id/dependencies` - List dependencies
- `POST /tasks/:id/dependencies` - Add dependency
- `DELETE /tasks/:id/dependencies/:blockingTaskId` - Remove

### Sharing

- `POST /tasks/:id/share` - Generate public link
- `GET /tasks/share/:token` - Access shared task (public)

---

## Timer

### `POST /timers/start`

Start timer session.

**Body:**

```json
{
  "taskId": "...",
  "type": "WORK"
}
```

### `POST /timers/stop`

Stop current session.

### `POST /timers/pause`

Pause timer.

### `POST /timers/resume`

Resume timer.

### `POST /timers/switch-task`

Switch to different task without stopping.

### `GET /timers/active`

Get current active session.

### `GET /timers/history`

Get session history with pagination.

### `GET /timers/stats`

Get timer statistics.

---

## Analytics

### `GET /analytics/daily?date=2024-12-06`

Get daily metrics.

### `GET /analytics/weekly?weekStart=2024-12-02`

Get weekly metrics.

### `GET /analytics/monthly?monthStart=2024-12-01`

Get monthly metrics.

### `GET /analytics/dashboard-stats`

Get dashboard summary with trends.

### `GET /analytics/heatmap`

Get activity heatmap data.

### `GET /analytics/streak`

Get productivity streak info.

**Response:**

```json
{
  "currentStreak": 5,
  "longestStreak": 12,
  "productiveDaysLast90": 45,
  "avgDailyTasks": 4.2,
  "streakStatus": "good"
}
```

### `GET /analytics/team/:workspaceId`

**Admin/Owner only** - Get team aggregate metrics.

**Response:**

```json
{
  "period": { "start": "...", "end": "..." },
  "teamTotals": {
    "totalTasksCompleted": 150,
    "totalMinutesWorked": 9000,
    "activeMembersCount": 5
  },
  "memberBreakdown": [...],
  "topPerformers": [...]
}
```

---

## AI

### `POST /ai/chat`

AI assistant with task creation capability.

**Body:**

```json
{
  "message": "Crea una tarea para mañana a las 3pm: revisar PR",
  "history": [],
  "workspaceId": "optional",
  "projectId": "optional"
}
```

**Response:**

```json
{
  "message": "He creado la tarea 'Revisar PR' para mañana a las 15:00.",
  "actions": [
    {
      "type": "CREATE_TASK",
      "data": { "title": "Revisar PR", "dueDate": "..." },
      "result": { "taskId": "...", "success": true }
    }
  ],
  "suggestions": ["¿Quieres agregar más detalles?"]
}
```

### `POST /ai/parse-task`

Parse natural language to structured task.

**Body:**

```json
{
  "input": "Urgente: llamar al cliente mañana",
  "timezone": "America/Mexico_City"
}
```

**Response:**

```json
{
  "title": "Llamar al cliente",
  "priority": "URGENT",
  "dueDate": "2024-12-07T09:00:00Z",
  "confidence": "HIGH",
  "reasoning": "Keyword 'urgente' detected..."
}
```

### `GET /ai/wellbeing`

Get wellbeing indicators.

**Response:**

```json
{
  "overallScore": 75,
  "burnoutRisk": "LOW",
  "workLifeBalance": 80,
  "focusQuality": 70,
  "insights": ["Tu productividad es consistente..."],
  "recommendations": ["Considera tomar breaks más frecuentes..."],
  "metrics": {
    "avgHoursPerDay": 6.5,
    "weekendWorkPercentage": 10
  }
}
```

### `POST /ai/workflow-suggestion`

Get AI-suggested workflow for project.

**Body:**

```json
{
  "projectName": "Landing Page Redesign",
  "projectDescription": "Rediseñar la landing page para mejorar conversiones",
  "objectives": "Aumentar tasa de conversión en 20%"
}
```

### Reports

- `POST /ai/reports/weekly` - Generate weekly report
- `POST /ai/reports/monthly` - Generate monthly report
- `POST /ai/reports/project/:projectId` - Generate project report
- `GET /ai/reports` - List reports
- `GET /ai/reports/:id` - Get report
- `DELETE /ai/reports/:id` - Delete report

### `GET /ai/model-stats`

Get AI model usage statistics (for cost monitoring).

---

## Cost Optimization

The AI service uses intelligent model selection:

| Task Type           | Model         | Cost Level |
| ------------------- | ------------- | ---------- |
| Chat, NL Parsing    | Flash         | Low        |
| Duration Prediction | Local → Flash | Minimal    |
| Weekly Reports      | Flash         | Low        |
| Monthly Reports     | Pro           | Medium     |
| Wellbeing Analysis  | Pro           | Medium     |

Local preprocessing is used when possible to reduce API calls.

---

## Error Responses

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

Common status codes:

- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
