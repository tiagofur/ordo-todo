# AI Features Documentation

Detailed guide for Ordo-Todo's AI capabilities, cost optimization, and integration.

## Overview

Ordo-Todo uses Google's Gemini AI for intelligent productivity features:

- **AI Chat**: Natural language task creation and assistance
- **NL Task Parsing**: Extract structured task data from text
- **Wellbeing Analysis**: Burnout risk and work-life balance indicators
- **Workflow Suggestions**: AI-generated project phases and tasks
- **Productivity Reports**: Weekly, monthly, and project-level insights

## Model Selection Strategy

To optimize API costs, the system uses intelligent model selection:

```
┌─────────────────────────────────────────────────────────┐
│                    Model Selection                       │
├─────────────────────────────────────────────────────────┤
│  Gemini Flash (gemini-2.0-flash-exp)                    │
│  ✓ Chat (simple queries)                                │
│  ✓ Natural language task parsing                        │
│  ✓ Duration prediction                                  │
│  ✓ Weekly reports                                       │
│  ✓ Workflow suggestions                                 │
│  Cost: ~$0.075/1M tokens                                │
├─────────────────────────────────────────────────────────┤
│  Gemini Pro (gemini-1.5-pro)                            │
│  ✓ Complex chat (long history)                          │
│  ✓ Monthly reports                                      │
│  ✓ Wellbeing analysis                                   │
│  ✓ Nuanced pattern detection                            │
│  Cost: ~$1.25/1M tokens                                 │
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
