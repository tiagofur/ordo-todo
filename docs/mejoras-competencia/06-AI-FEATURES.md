# 🤖 AI Features - Ordo-Todo

## Estado: ✅ COMPLETADO (16 Diciembre 2024)

Este documento describe las funcionalidades de IA implementadas en Ordo-Todo para crear un "Productivity Copilot" no intrusivo.

---

## 📋 Resumen de Features AI Implementadas

| Feature | Estado | Prioridad |
|---------|--------|-----------|
| Smart Semantic Search | ✅ Completado | Alta |
| AI Meeting Assistant | ✅ Completado | Alta |
| Burnout Prevention Engine | ✅ Completado | Alta |
| Smart Context-Aware Insights | ✅ Completado | Media |
| Focus Sessions con Audio | ✅ Completado | Media |
| Team Workload View | ✅ Completado | Media |

---

## 1. 🔍 Smart Semantic Search

### Descripción
Búsqueda inteligente con interpretación de lenguaje natural usando Gemini AI.

### Funcionalidades
- **Interpretación de queries** - Entiende "tareas urgentes de esta semana"
- **Búsqueda multi-entidad** - Tareas, proyectos y hábitos en una sola búsqueda
- **Score de relevancia** - Ordena resultados por relevancia semántica
- **Keyword highlighting** - Resalta matches en resultados
- **Auto-suggestions** - Sugerencias mientras escribes
- **Q&A Natural** - Responde preguntas como "¿cuántas tareas tengo vencidas?"

### Backend
- **Service:** `SemanticSearchService` (`/apps/backend/src/search/`)
- **Controller:** `SearchController`
- **Endpoints:**
  - `GET /search?q=<query>` - Búsqueda semántica
  - `GET /search/suggestions?q=<query>` - Autocompletado
  - `GET /search/ask?q=<question>` - Q&A natural
  - `GET /search/quick?q=<query>` - Búsqueda rápida

### Frontend
- **Component:** `SmartSearch` (`/apps/web/src/components/search/smart-search.tsx`)
- **Hook:** `useDebouncedValue` (`/apps/web/src/hooks/use-debounced-value.ts`)

### API Client
```typescript
apiClient.semanticSearch(query, options)
apiClient.searchSuggestions(query)
apiClient.askAI(question)
```

---

## 2. 🎤 AI Meeting Assistant

### Descripción
Analiza transcripciones de reuniones y extrae action items, decisiones y resúmenes.

### Funcionalidades
- **Análisis completo** - Extrae resumen, puntos clave, action items, decisiones
- **Detección de participantes** - Identifica quién dijo qué
- **Análisis de sentimiento** - POSITIVE, NEUTRAL, NEGATIVE, MIXED
- **Conversión a tareas** - Action items → Tareas en proyecto
- **Estilos de resumen** - Executive, Detailed, Bullet Points

### Backend
- **Service:** `MeetingAssistantService` (`/apps/backend/src/meetings/`)
- **Controller:** `MeetingsController`
- **Endpoints:**
  - `POST /meetings/analyze` - Análisis completo
  - `POST /meetings/extract-actions` - Solo action items
  - `POST /meetings/summary` - Solo resumen
  - `POST /meetings/convert-to-tasks` - Convertir a tareas
  - `POST /meetings/quick-analyze` - Análisis rápido

### API Client
```typescript
apiClient.analyzeMeetingTranscript(transcript, options)
apiClient.extractMeetingActions(transcript, projectContext)
apiClient.generateMeetingSummary(transcript, style)
apiClient.convertActionsToTasks(actionItems, options)
```

---

## 3. 🧠 Burnout Prevention Engine

### Descripción
Sistema proactivo de detección de riesgo de burnout y recomendaciones de bienestar.

### Funcionalidades
- **Análisis de patrones** - Detecta trabajo nocturno, fin de semana, sesiones largas
- **Risk Score** - 0-100 con niveles LOW, MODERATE, HIGH, CRITICAL
- **Recomendaciones de descanso** - Sugerencias contextuales
- **Intervenciones automáticas** - Recordatorios no intrusivos
- **Weekly Summary** - Resumen semanal de bienestar
- **Notificaciones proactivas** - Cron jobs diarios/semanales

### Backend
- **Service:** `BurnoutPreventionService` (`/apps/backend/src/ai/`)
- **Controller:** Endpoints en `AIController`
- **Endpoints:**
  - `GET /ai/burnout/analysis` - Análisis completo
  - `GET /ai/burnout/patterns` - Patrones de trabajo
  - `GET /ai/burnout/recommendations` - Recomendaciones
  - `GET /ai/burnout/intervention` - Check intervención
  - `GET /ai/burnout/weekly-summary` - Resumen semanal

### Métricas analizadas
- Promedio de horas trabajadas por día
- Trabajo nocturno (después de 9pm)
- Trabajo en fines de semana
- Sesiones largas (>4 horas continuas)
- Balance vida-trabajo
- Calidad de enfoque
- Consistencia de horarios

---

## 4. 💡 Smart Context-Aware Insights

### Descripción
Insights proactivos basados en el contexto actual del usuario.

### Tipos de insights
| Tipo | Descripción | Trigger |
|------|-------------|---------|
| `PRODUCTIVITY_PEAK` | Hora óptima de trabajo | AI learning |
| `UPCOMING_DEADLINES` | Recordatorio de deadlines | Tasks con due date cercano |
| `SUGGESTED_BREAKS` | Sugerencia de descanso | Sesión larga detectada |
| `COMPLETION_CELEBRATION` | Celebración de logros | Task/Habit completado |
| `WORKLOAD_IMBALANCE` | Alerta de sobrecarga | Muchas tareas asignadas |
| `ENERGY_OPTIMIZATION` | Mejor horario | Estadísticas de productividad |
| `REST_SUGGESTION` | Sugerencia de descanso | Fin del día |
| `ACHIEVEMENT_CELEBRATION` | Motivación | Racha o logro alcanzado |

### Backend
- **Service:** `ProductivityCoachService` (`/apps/backend/src/chat/`)
- **Método:** `getProactiveInsights()`

---

## 5. 🎵 Focus Sessions con Audio Ambient

### Descripción
Sesiones de trabajo enfocado con sonidos ambient para mejorar concentración.

### Funcionalidades
- **Tracks ambient** - Lluvia, café, bosque, océano, ruido blanco, etc.
- **Beats binaurales** - Para concentración profunda
- **Modos de enfoque** - Pomodoro, Deep Work, Flow, Sprint
- **Favoritos** - Guardar tracks preferidos
- **Preferencias** - Volumen, fade in/out
- **Estadísticas** - Tiempo en focus, sesiones, rachas

### Backend
- **Service:** `FocusAudioService` (`/apps/backend/src/focus/`)
- **Controller:** `FocusController`
- **Endpoints:**
  - `GET /focus/tracks` - Listar tracks
  - `GET /focus/tracks/recommended` - Recomendados
  - `GET /focus/modes` - Modos disponibles
  - `GET /focus/favorites` - Favoritos del usuario
  - `POST /focus/favorites/:trackId` - Toggle favorito
  - `GET /focus/preferences` - Preferencias
  - `PATCH /focus/preferences` - Actualizar preferencias
  - `GET /focus/stats` - Estadísticas

### Frontend
- **Components:**
  - `AmbientAudioPlayer` (`/apps/web/src/components/focus/`)
  - `FocusModeSelector`
- **Hook:** `useAmbientAudio` (`/apps/web/src/hooks/`)
- **Página:** `/focus` mejorada con integración de audio

### API Client
```typescript
apiClient.getFocusTracks()
apiClient.getRecommendedTracks()
apiClient.getFocusModes()
apiClient.toggleFocusFavorite(trackId)
apiClient.getFocusStats()
```

---

## 6. 👥 Team Workload View

### Descripción
Vista de carga de trabajo del equipo con métricas y sugerencias de redistribución.

### Funcionalidades
- **Workload Score** - Score 0-100 por miembro
- **Niveles** - LOW, MODERATE, HIGH, OVERLOADED
- **Métricas por miembro:**
  - Tareas asignadas/completadas/vencidas
  - Horas trabajadas esta semana
  - Capacidad restante
  - Tendencia (INCREASING, STABLE, DECREASING)
  - Tarea actual
- **Sugerencias de redistribución** - Automáticas con Gemini AI
- **Vista de workspace** - Resumen agregado del equipo

### Backend
- **Service:** `TeamWorkloadService` (`/apps/backend/src/collaboration/`)
- **Controller:** `TeamWorkloadController`
- **Endpoints:**
  - `GET /workload/workspace/:id` - Resumen del workspace
  - `GET /workload/member/:userId` - Carga individual
  - `GET /workload/me` - Mi carga
  - `GET /workload/suggestions/:id` - Sugerencias de balanceo

### API Client
```typescript
apiClient.getWorkspaceWorkload(workspaceId)
apiClient.getMemberWorkload(userId, workspaceId)
apiClient.getMyWorkload(workspaceId)
apiClient.getWorkloadSuggestions(workspaceId)
```

---

## 📊 Traducciones

Todas las features tienen traducciones completas en:
- 🇪🇸 Español (`es.json`)
- 🇺🇸 English (`en.json`)
- 🇧🇷 Português (`pt-br.json`)

### Secciones agregadas
- `Focus` - Audio ambient y modos
- `Search` - Búsqueda semántica
- `Meetings` - Asistente de reuniones
- `Workload` - Carga de trabajo
- `Wellbeing` - Bienestar y burnout

---

## 🔗 Integración con Gemini AI

Todos los features AI usan el servicio `GeminiAIService` con el método público:

```typescript
geminiAI.generate(systemPrompt, userPrompt): Promise<string>
```

Los prompts están diseñados para retornar JSON estructurado que luego se parsea.

---

## ✅ Estado de Implementación

| Componente | Web | Desktop | Mobile |
|------------|-----|---------|--------|
| Smart Search | ✅ | 🔜 | 🔜 |
| Meeting Assistant | ✅ Backend | 🔜 | 🔜 |
| Burnout Prevention | ✅ | 🔜 | 🔜 |
| Focus Audio | ✅ | 🔜 | 🔜 |
| Team Workload | ✅ Backend | 🔜 | 🔜 |

**Última actualización:** 16 Diciembre 2024
