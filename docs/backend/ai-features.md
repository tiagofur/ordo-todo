# AI Features Documentation

Detailed guide for Ordo-Todo's AI capabilities, cost optimization, and integration.

## Overview

Ordo-Todo uses Google's Gemini AI for intelligent productivity features:

### Current Features ✅
- **AI Chat**: Natural language task creation and assistance
- **NL Task Parsing**: Extract structured task data from text
- **Wellbeing Analysis**: Burnout risk and work-life balance indicators
- **Workflow Suggestions**: AI-generated project phases and tasks
- **Productivity Reports**: Weekly, monthly, and project-level insights
- **Productivity Coach**: Context-aware AI coach with task/timer awareness
- **Chat Persistence**: Conversation history saved to database
- **Task Decomposition**: Break complex tasks into subtasks
- **Proactive Insights**: AI-initiated productivity tips
- **Real-Time Notifications**: WebSocket push for notifications and alerts

### Future Features 🚧
- **Streaming Responses**: Real-time AI response streaming via SSE/WebSocket
- **Voice Input**: Voice-to-text for task creation
- **Calendar Integration**: Smart scheduling with Google Calendar

## SDK Information

**Current Package:** `@google/genai` v1.32.0 ✅  
**Migration Status:** Completed - using latest unified SDK

See [IMPROVEMENTS.md](./IMPROVEMENTS.md) for migration details.

## Model Selection Strategy

To optimize API costs, the system uses intelligent model selection:

```
┌─────────────────────────────────────────────────────────┐
│                    Model Selection                       │
├─────────────────────────────────────────────────────────┤
│  Gemini 2.0 Flash (gemini-2.0-flash)                    │
│  ✓ Chat (simple queries)                                │
│  ✓ Natural language task parsing                        │
│  ✓ Duration prediction                                  │
│  ✓ Weekly reports                                       │
│  ✓ Workflow suggestions                                 │
│  ✓ Productivity Coach (default)                         │
│  ✓ Task decomposition                                   │
│  Cost: ~$0.075/1M tokens                                │
├─────────────────────────────────────────────────────────┤
│  Gemini 2.0 Flash Thinking (complex analysis)           │
│  ✓ Monthly reports                                      │
│  ✓ Wellbeing analysis                                   │
│  ✓ Nuanced pattern detection                            │
│  Cost: Higher but more capable reasoning                │
└─────────────────────────────────────────────────────────┘
```

**Estimated Savings**: 50-70% reduction in API costs vs using Pro for everything.

## Local Preprocessing

Before calling Gemini, the system performs local preprocessing:

### For Task Parsing
1. Keyword extraction for priority (urgente, importante, etc.)
2. Time pattern matching for estimates (2 horas, 30 minutos)
3. Only calls API if local confidence is LOW

### For Duration Prediction
1. Uses historical user data from AIProfile
2. Falls back to Gemini only when needed

### For Wellbeing
1. All metrics calculated locally (hours, streaks, weekend work)
2. API only adds qualitative insights

## API Endpoints

### POST /ai/chat

AI assistant with function calling.

**Request:**
```json
{
  "message": "Necesito crear una tarea para revisar el código mañana",
  "history": [
    { "role": "user", "content": "Hola" },
    { "role": "assistant", "content": "¡Hola! ¿En qué puedo ayudarte?" }
  ],
  "workspaceId": "optional-workspace-id",
  "projectId": "optional-project-id"
}
```

**Response:**
```json
{
  "message": "He creado la tarea 'Revisar el código' para mañana.",
  "actions": [
    {
      "type": "CREATE_TASK",
      "data": {
        "title": "Revisar el código",
        "dueDate": "2024-12-07T09:00:00Z",
        "priority": "MEDIUM"
      },
      "result": { "taskId": "clx123...", "success": true }
    }
  ],
  "suggestions": [
    "¿Quieres agregar una descripción?",
    "¿Asignar a alguien del equipo?"
  ]
}
```

**Action Types:**
- `CREATE_TASK` - Create new task
- `UPDATE_TASK` - Modify existing task
- `COMPLETE_TASK` - Mark task as done
- `LIST_TASKS` - Query tasks
- `NONE` - Just a conversational response

### POST /ai/parse-task

Parse natural language to structured task.

**Request:**
```json
{
  "input": "Urgente: enviar propuesta al cliente antes del viernes 5pm",
  "projectId": "optional-project-id",
  "timezone": "America/Mexico_City"
}
```

**Response:**
```json
{
  "title": "Enviar propuesta al cliente",
  "description": null,
  "dueDate": "2024-12-13T17:00:00-06:00",
  "priority": "URGENT",
  "estimatedMinutes": null,
  "tags": ["cliente", "propuesta"],
  "confidence": "HIGH",
  "reasoning": "Detectado 'urgente' como prioridad. 'Viernes 5pm' interpretado como 2024-12-13 17:00."
}
```

### GET /ai/wellbeing

Analyze user wellbeing from work patterns.

**Query Parameters:**
- `startDate` (optional): Start of analysis period
- `endDate` (optional): End of analysis period (defaults to last 30 days)

**Response:**
```json
{
  "overallScore": 72,
  "burnoutRisk": "LOW",
  "workLifeBalance": 78,
  "focusQuality": 65,
  "consistencyScore": 80,
  "insights": [
    "Tu productividad es más alta por las mañanas",
    "Has mantenido un ritmo consistente esta semana",
    "Trabajas ocasionalmente en fines de semana (15%)"
  ],
  "recommendations": [
    "Considera planificar tareas complejas antes de las 12pm",
    "Tomar descansos cortos cada 90 minutos mejora el enfoque",
    "Intenta desconectar completamente los domingos"
  ],
  "metrics": {
    "avgHoursPerDay": 6.8,
    "avgSessionsPerDay": 4.2,
    "longestStreak": 8,
    "weekendWorkPercentage": 15,
    "lateNightWorkPercentage": 5
  }
}
```

**Burnout Risk Thresholds:**
- `LOW`: < 8 hrs/day, < 20% weekend, < 15% late night
- `MEDIUM`: 8-10 hrs/day, 20-40% weekend, 15-30% late night
- `HIGH`: > 10 hrs/day, > 40% weekend, > 30% late night

### POST /ai/workflow-suggestion

Get AI-suggested workflow phases.

**Request:**
```json
{
  "projectName": "App Móvil de Delivery",
  "projectDescription": "Aplicación para pedidos de comida con tracking en tiempo real",
  "objectives": "Lanzar MVP en 3 meses"
}
```

**Response:**
```json
{
  "phases": [
    {
      "name": "Planificación y Diseño",
      "description": "Definir requerimientos y crear wireframes",
      "suggestedTasks": [
        { "title": "Definir user stories", "estimatedMinutes": 120, "priority": "HIGH" },
        { "title": "Crear wireframes principales", "estimatedMinutes": 180, "priority": "HIGH" },
        { "title": "Arquitectura técnica", "estimatedMinutes": 90, "priority": "MEDIUM" }
      ]
    },
    {
      "name": "Desarrollo Core",
      "description": "Implementar funcionalidades principales",
      "suggestedTasks": [
        { "title": "Setup proyecto React Native", "estimatedMinutes": 60, "priority": "HIGH" },
        { "title": "API de autenticación", "estimatedMinutes": 180, "priority": "HIGH" }
      ]
    }
  ],
  "estimatedDuration": "10-12 semanas",
  "tips": [
    "Prioriza el flujo de pedido completo antes de features secundarias",
    "Integra tracking desde el inicio para evitar refactors",
    "Considera usar Firebase para notificaciones push"
  ]
}
```

### Reports

#### POST /ai/reports/weekly

Generate weekly productivity report.

#### POST /ai/reports/monthly

Generate monthly productivity report (uses Pro model).

#### POST /ai/reports/project/:projectId

Generate project-specific report.

#### GET /ai/reports

List user's reports with pagination.

**Query Parameters:**
- `scope`: Filter by type (WEEKLY_SCHEDULED, MONTHLY_SCHEDULED, PROJECT_SUMMARY)
- `limit`: Max results (default: 10)
- `offset`: Pagination offset

### GET /ai/model-stats

Get model usage statistics for cost monitoring.

**Response:**
```json
{
  "flash": 142,
  "pro": 23,
  "estimatedCostSavings": "86% requests using cheaper Flash model"
}
```

## Configuration

### Environment Variables

```env
# Required
GEMINI_API_KEY=your-api-key

# Optional (defaults shown)
GEMINI_FLASH_MODEL=gemini-2.0-flash-exp
GEMINI_PRO_MODEL=gemini-1.5-pro
```

### User Preferences (DB)

```prisma
model UserPreferences {
  enableAI              Boolean @default(true)
  aiAggressiveness      Int     @default(5)  // 1-10 scale
  aiSuggestTaskDurations Boolean @default(true)
  aiSuggestPriorities   Boolean @default(true)
  aiSuggestScheduling   Boolean @default(true)
  aiWeeklyReports       Boolean @default(true)
}
```

## Error Handling

When Gemini is unavailable:
1. Features return mock/fallback data
2. Logger warns about missing API key
3. Local algorithms provide basic functionality

**Example Fallback:**
```json
{
  "confidence": "LOW",
  "reasoning": "Parsing local sin IA - configure GEMINI_API_KEY para mejor precisión"
}
```

---

## Productivity Coach (Planned)

### Overview

The Productivity Coach is a context-aware AI assistant that understands:
- User's pending tasks (priority, deadlines)
- Today's completed work
- Active timer session
- Historical productivity patterns
- Peak performance hours

### Endpoint: POST /ai/coach/chat

**Request:**
```json
{
  "message": "¿Cuál tarea debo hacer primero?",
  "conversationId": "optional-existing-conversation-id"
}
```

**Response:**
```json
{
  "conversationId": "clx789...",
  "message": "Basado en tus deadlines, te recomiendo empezar con 'Revisar PR' que vence mañana. Tienes tu mejor enfoque entre 9-11am, considera hacerla ahora.",
  "suggestions": [
    "¿Quieres que te ayude a descomponer esta tarea?",
    "¿Inicio un timer para esta tarea?"
  ],
  "actions": []
}
```

### Endpoint: GET /chat/conversations

List saved conversations.

**Response:**
```json
{
  "conversations": [
    {
      "id": "clx789...",
      "title": "Planificación del día",
      "lastMessage": "Gracias por los tips!",
      "createdAt": "2024-12-10T09:00:00Z",
      "messageCount": 5
    }
  ],
  "total": 15
}
```

### Endpoint: POST /ai/decompose-task

Break a complex task into subtasks.

**Request:**
```json
{
  "taskId": "task-id-123",
  "complexity": "MEDIUM"
}
```

**Response:**
```json
{
  "originalTask": "Implementar sistema de pagos",
  "suggestedSubtasks": [
    { "title": "Investigar proveedores de pago (Stripe, PayPal)", "estimatedMinutes": 60 },
    { "title": "Diseñar esquema de base de datos", "estimatedMinutes": 45 },
    { "title": "Implementar API de checkout", "estimatedMinutes": 180 },
    { "title": "Integrar frontend con API", "estimatedMinutes": 120 },
    { "title": "Pruebas de pagos de prueba", "estimatedMinutes": 60 }
  ],
  "totalEstimate": "7.75 horas",
  "tips": [
    "Usa modo sandbox para todas las pruebas",
    "Considera webhooks para actualizaciones de estado"
  ]
}
```

### Endpoint: GET /ai/insights

Get proactive productivity insights.

**Response:**
```json
{
  "insights": [
    {
      "type": "OVERDUE_ALERT",
      "message": "Tienes 3 tareas vencidas. ¿Quieres ayuda para priorizarlas?",
      "priority": "HIGH",
      "actionable": true
    },
    {
      "type": "PEAK_HOUR_TIP",
      "message": "Son las 10am, tu hora más productiva. Considera abordar tareas complejas ahora.",
      "priority": "MEDIUM",
      "actionable": false
    }
  ]
}
```

### Endpoint: POST /ai/decompose-task

Break down a complex task into manageable subtasks using AI.

**Request:**
```json
{
  "taskTitle": "Implementar sistema de autenticación",
  "taskDescription": "Agregar login, registro y manejo de sesiones",
  "projectContext": "Aplicación web de e-commerce",
  "maxSubtasks": 5
}
```

**Response:**
```json
{
  "subtasks": [
    {
      "title": "Diseñar schema de usuarios",
      "description": "Definir modelo de datos para User y Session",
      "estimatedMinutes": 30,
      "priority": "HIGH",
      "order": 1
    },
    {
      "title": "Implementar endpoint de registro",
      "description": "POST /auth/register con validación",
      "estimatedMinutes": 60,
      "priority": "HIGH",
      "order": 2
    },
    {
      "title": "Implementar endpoint de login",
      "description": "POST /auth/login con JWT",
      "estimatedMinutes": 45,
      "priority": "HIGH",
      "order": 3
    }
  ],
  "reasoning": "Descomposición basada en flujo típico de auth: schema → registro → login → protección de rutas",
  "totalEstimatedMinutes": 135
}
```

## Chat Conversations API

The Chat module provides persistent conversation history with the AI coach.

### Endpoint: GET /chat/conversations

List all conversations for current user.

**Query Parameters:**
- `limit` (optional): Number of conversations (default: 20)
- `offset` (optional): Pagination offset
- `includeArchived` (optional): Include archived conversations

**Response:**
```json
{
  "conversations": [
    {
      "id": "conv_123",
      "title": "Ayuda con priorización",
      "messageCount": 8,
      "lastMessage": "Gracias, eso me ayuda mucho!",
      "createdAt": "2024-12-10T09:00:00Z",
      "updatedAt": "2024-12-10T09:15:00Z"
    }
  ],
  "total": 15,
  "limit": 20,
  "offset": 0
}
```

### Endpoint: POST /chat/conversations

Create a new conversation, optionally with initial message.

**Request:**
```json
{
  "title": "Planificación de sprint",
  "workspaceId": "ws_123",
  "initialMessage": "Ayúdame a planificar las tareas para esta semana"
}
```

### Endpoint: POST /chat/conversations/:id/messages

Send a message and receive AI response.

**Request:**
```json
{
  "message": "¿Cuáles son mis tareas más urgentes?"
}
```

**Response:**
```json
{
  "conversationId": "conv_123",
  "message": {
    "id": "msg_456",
    "role": "USER",
    "content": "¿Cuáles son mis tareas más urgentes?",
    "createdAt": "2024-12-10T09:20:00Z"
  },
  "aiResponse": {
    "id": "msg_457",
    "role": "ASSISTANT",
    "content": "Según tus tareas activas, tienes 2 urgentes...",
    "metadata": {
      "actions": [],
      "suggestions": ["Ver tareas de hoy", "Iniciar timer"],
      "processingTimeMs": 850
    },
    "createdAt": "2024-12-10T09:20:01Z"
  }
}
```

### Endpoint: GET /chat/insights

Get proactive AI insights based on current productivity status.

**Response:**
```json
[
  {
    "type": "OVERDUE_ALERT",
    "message": "Tienes 2 tareas vencidas",
    "priority": "HIGH",
    "actionable": true,
    "action": {
      "type": "SHOW_OVERDUE",
      "data": { "taskIds": ["task_1", "task_2"] }
    }
  },
  {
    "type": "PEAK_HOUR_TIP",
    "message": "Son las 10:00, tu hora más productiva",
    "priority": "MEDIUM",
    "actionable": true,
    "action": {
      "type": "START_TASK",
      "data": { "taskId": "task_3" }
    }
  }
]
```

## Real-Time Notifications (WebSocket)

Connect to the notifications gateway for real-time updates.

**Namespace:** `/notifications`

**Authentication:** Pass JWT token in handshake auth.

### Client Connection

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3101/notifications', {
  auth: { token: 'your-jwt-token' }
});
```

### Events from Server

| Event | Payload | Description |
|-------|---------|-------------|
| `connected` | `{ userId, connectedAt }` | Connection confirmed |
| `notification:new` | Notification object | New notification |
| `notification:count` | `{ count }` | Unread count update |
| `task:reminder` | Task reminder object | Upcoming task alert |
| `timer:alert` | Timer alert object | Session complete/break |
| `ai:insight` | Insight object | Proactive AI suggestion |

---

## Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Backend architecture
- [IMPROVEMENTS.md](./IMPROVEMENTS.md) - Implementation roadmap
- [README.md](./README.md) - Complete API reference

