# Plan de Implementación: Sistema de Analytics y Reportes de IA

## Visión General

Sistema completo de seguimiento de tiempo, métricas de productividad y reportes inteligentes con IA que aprende de los patrones del usuario y proporciona insights personalizados.

---

## Estado Actual ✅

### 1. Sistema de Timer (COMPLETADO)
- ✅ TimeSession entity en DB con tracking completo
- ✅ Pause tracking (pauseCount, totalPauseTime, pauseData)
- ✅ Task switching con parentSessionId
- ✅ Backend endpoints (start, stop, pause, resume, switchTask)
- ✅ Frontend UI con Pomodoro y modo continuo
- ✅ Notificaciones del navegador
- ✅ Sonidos de finalización
- ✅ Auto-start de breaks y pomodoros
- ✅ Selector de tareas
- ✅ Métricas en tiempo real

### 2. Modelos de Base de Datos (COMPLETADO)
- ✅ TimeSession - tracking de sesiones de trabajo
- ✅ DailyMetrics - métricas agregadas por día
- ✅ AIProfile - perfil de productividad del usuario
- ✅ ProductivityReport - reportes con insights de IA

### 3. Core Domain (PARCIAL)
- ✅ DailyMetrics entity básica
- ✅ Get daily metrics use case
- ✅ MockAIService (placeholder)
- ⏳ Falta: Use cases completos para analytics
- ⏳ Falta: AIProfile entity y use cases
- ⏳ Falta: ProductivityReport entity y use cases

---

## Fases de Implementación

## FASE 1: Auto-tracking de Métricas 📊
**Objetivo**: Conectar TimeSessions con DailyMetrics automáticamente

### 1.1 Backend - Agregación Automática de Métricas
**Archivos a crear/modificar**:
- `packages/core/src/analytics/usecase/update-daily-metrics.usecase.ts`
- `packages/core/src/analytics/usecase/calculate-focus-score.usecase.ts`
- `apps/backend/src/analytics/analytics.service.ts`

**Tareas**:
- [ ] Crear `UpdateDailyMetricsUseCase`
  - Recibe userId, date, incrementos (tasks, pomodoros, minutes)
  - Busca o crea DailyMetrics para esa fecha
  - Actualiza contadores atómicamente
- [ ] Crear `CalculateFocusScoreUseCase`
  - Calcula score basado en pauseCount y totalPauseTime
  - Fórmula: `1 - (totalPauseTime / totalWorkTime)`
  - Penaliza pausas frecuentes
- [ ] Integrar en TimersService
  - Al hacer `stop()` con wasCompleted=true
  - Calcular minutes = (duration - totalPauseTime) / 60
  - Llamar a UpdateDailyMetrics
  - Si es WORK o CONTINUOUS, incrementar minutesWorked
  - Si es WORK (Pomodoro), incrementar pomodorosCompleted

### 1.2 Backend - Repositorio de Analytics
**Archivos a crear/modificar**:
- `apps/backend/src/repositories/analytics.repository.ts`
- `apps/web/src/server/repositories/analytics.prisma.ts`

**Tareas**:
- [ ] Implementar `AnalyticsRepository` con Prisma
  - `findOrCreateDailyMetrics(userId, date)`
  - `updateDailyMetrics(id, updates)`
  - `getDailyMetrics(userId, date)`
  - `getMetricsRange(userId, startDate, endDate)`
  - `getWeeklyMetrics(userId, weekStart)`
  - `getMonthlyMetrics(userId, monthStart)`

### 1.3 Backend - Endpoints tRPC
**Archivos a crear/modificar**:
- `apps/web/src/server/api/routers/analytics.ts`

**Tareas**:
- [ ] `analytics.getDailyMetrics` - obtener métricas de un día
- [ ] `analytics.getWeeklyMetrics` - obtener métricas de semana
- [ ] `analytics.getMonthlyMetrics` - obtener métricas de mes
- [ ] `analytics.getDateRangeMetrics` - rango personalizado

### 1.4 Testing
**Tareas**:
- [ ] Test: Crear TimeSession y verificar DailyMetrics se actualiza
- [ ] Test: Múltiples sesiones en el mismo día se agregan correctamente
- [ ] Test: Focus score se calcula correctamente
- [ ] Test: No se duplican registros de DailyMetrics

---

## FASE 2: Dashboard de Analytics 📈
**Objetivo**: Visualizar métricas de productividad

### 2.1 Instalación de Dependencias
**Tareas**:
- [ ] Instalar recharts: `npm install recharts --workspace=@ordo-todo/web`
- [ ] Verificar date-fns instalado

### 2.2 Frontend - API Hooks
**Archivos a crear/modificar**:
- `apps/web/src/lib/api-hooks.ts`

**Tareas**:
- [ ] `useDailyMetrics(date)` - hook para métricas de un día
- [ ] `useWeeklyMetrics(weekStart)` - hook para métricas semanales
- [ ] `useMonthlyMetrics(monthStart)` - hook para métricas mensuales

### 2.3 Frontend - Componentes de Visualización
**Archivos a crear**:
- `apps/web/src/components/analytics/daily-metrics-card.tsx`
- `apps/web/src/components/analytics/weekly-chart.tsx`
- `apps/web/src/components/analytics/monthly-summary.tsx`
- `apps/web/src/components/analytics/focus-score-gauge.tsx`
- `apps/web/src/components/analytics/productivity-heatmap.tsx`

**Tareas**:
- [ ] **DailyMetricsCard**
  - Muestra métricas del día actual
  - Tareas creadas/completadas
  - Minutos trabajados (formato: Xh Ym)
  - Pomodoros completados
  - Focus score con gauge visual
- [ ] **WeeklyChart**
  - Gráfico de barras de últimos 7 días
  - Eje X: días de la semana
  - Eje Y dual: tasks completadas + minutos trabajados
  - Colores diferenciados
- [ ] **MonthlySummary**
  - Resumen del mes actual
  - Total de tasks completadas
  - Total de horas trabajadas
  - Promedio diario
  - Mejor/peor día
- [ ] **FocusScoreGauge**
  - Gauge circular (0-100)
  - Verde (80-100), Amarillo (50-79), Rojo (0-49)
  - Tooltip con explicación
- [ ] **ProductivityHeatmap**
  - Estilo GitHub contributions
  - Últimos 3 meses
  - Color intensity basado en minutos trabajados

### 2.4 Frontend - Página de Analytics
**Archivos a crear**:
- `apps/web/src/app/(pages)/analytics/page.tsx`
- `apps/web/src/app/(pages)/analytics/layout.tsx`

**Tareas**:
- [ ] Crear layout con tabs: Overview / Weekly / Monthly
- [ ] Tab Overview: DailyMetricsCard + WeeklyChart
- [ ] Tab Weekly: Gráficos detallados de la semana
- [ ] Tab Monthly: Resumen mensual + Heatmap
- [ ] Responsive design

---

## FASE 3: AIProfile - Aprendizaje de Patrones 🧠
**Objetivo**: Sistema que aprende los patrones de productividad del usuario

### 3.1 Core Domain - AIProfile Entity
**Archivos a crear**:
- `packages/core/src/ai/model/ai-profile.entity.ts`
- `packages/core/src/ai/provider/ai-profile.repository.ts`

**Tareas**:
- [ ] Crear `AIProfile` entity
  - peakHours: Record<number, number> // 0-23 -> score
  - peakDays: Record<number, number> // 0-6 -> score
  - avgTaskDuration: number
  - completionRate: number
  - categoryPreferences: Record<string, number>
- [ ] Métodos:
  - `updatePeakHour(hour, score)`
  - `updatePeakDay(dayOfWeek, score)`
  - `recalculateAvgDuration(durations[])`
  - `updateCompletionRate(completed, total)`

### 3.2 Core Domain - Use Cases de Learning
**Archivos a crear**:
- `packages/core/src/ai/usecase/learn-from-session.usecase.ts`
- `packages/core/src/ai/usecase/get-optimal-schedule.usecase.ts`
- `packages/core/src/ai/usecase/predict-task-duration.usecase.ts`

**Tareas**:
- [ ] **LearnFromSessionUseCase**
  - Recibe: TimeSession completado
  - Extrae: hora del día, día de semana, duración, pausas
  - Calcula: productivity score para ese momento
  - Actualiza: AIProfile.peakHours y peakDays
  - Se ejecuta automáticamente al completar sesión
- [ ] **GetOptimalScheduleUseCase**
  - Basado en peakHours del perfil
  - Devuelve: array de horas recomendadas para trabajo
  - Ordena por score descendente
- [ ] **PredictTaskDurationUseCase**
  - Basado en avgTaskDuration y categoría
  - Devuelve: estimación en minutos
  - Considera histórico de tareas similares

### 3.3 Backend - Integración de Learning
**Archivos a modificar**:
- `apps/backend/src/timers/timers.service.ts`
- `apps/backend/src/repositories/ai-profile.repository.ts`

**Tareas**:
- [ ] Implementar `AIProfileRepository` con Prisma
- [ ] En `stop()`, si wasCompleted=true:
  - Llamar a LearnFromSessionUseCase
  - Actualizar AIProfile del usuario
- [ ] Crear endpoint tRPC para obtener AIProfile

### 3.4 Frontend - Insights de Productividad
**Archivos a crear**:
- `apps/web/src/components/analytics/productivity-insights.tsx`
- `apps/web/src/components/analytics/peak-hours-chart.tsx`

**Tareas**:
- [ ] **ProductivityInsights**
  - Muestra recomendaciones basadas en AIProfile
  - "Tus mejores horas son X-Y"
  - "Trabajas mejor los días X"
  - "Duración promedio de tus tareas: X min"
- [ ] **PeakHoursChart**
  - Gráfico de línea o barras con horas del día
  - Muestra score de productividad por hora
  - Resalta las "golden hours"

---

## FASE 4: Reportes con IA (Gemini) 🤖
**Objetivo**: Generar reportes inteligentes con insights y recomendaciones

### 4.1 Setup de Gemini API
**Archivos a crear**:
- `packages/core/src/ai/gemini-ai.service.ts`
- `apps/backend/.env` (añadir GEMINI_API_KEY)

**Tareas**:
- [ ] Instalar SDK: `npm install @google/generative-ai`
- [ ] Crear GeminiAIService que implementa AIService
- [ ] Configurar API key en variables de entorno
- [ ] Métodos:
  - `generateProductivityReport(metrics, sessions, profile)`
  - `analyzeTaskPatterns(tasks, sessions)`
  - `suggestOptimizations(profile, recentMetrics)`

### 4.2 Core Domain - ProductivityReport Entity
**Archivos a crear**:
- `packages/core/src/ai/model/productivity-report.entity.ts`
- `packages/core/src/ai/provider/productivity-report.repository.ts`

**Tareas**:
- [ ] Crear `ProductivityReport` entity
  - scope: ReportScope
  - summary: string
  - strengths: string[]
  - weaknesses: string[]
  - recommendations: string[]
  - patterns: string[]
  - productivityScore: number (0-100)
  - metricsSnapshot: TaskTimeMetrics
- [ ] Métodos de validación y serialización

### 4.3 Core Domain - Use Cases de Reportes
**Archivos a crear**:
- `packages/core/src/ai/usecase/generate-task-report.usecase.ts`
- `packages/core/src/ai/usecase/generate-weekly-report.usecase.ts`
- `packages/core/src/ai/usecase/generate-monthly-report.usecase.ts`

**Tareas**:
- [ ] **GenerateTaskReportUseCase**
  - Al completar una tarea
  - Analiza todas las TimeSessions de esa tarea
  - Calcula métricas: tiempo total, pausas, interrupciones
  - Llama a Gemini para generar insights
  - Guarda ProductivityReport con scope=TASK_COMPLETION
- [ ] **GenerateWeeklyReportUseCase**
  - Se ejecuta automáticamente cada domingo
  - Recopila DailyMetrics de los últimos 7 días
  - Recopila todas las TimeSessions de la semana
  - Llama a Gemini con contexto completo
  - Genera reporte con scope=WEEKLY_SCHEDULED
- [ ] **GenerateMonthlyReportUseCase**
  - Similar a weekly pero para el mes
  - Incluye comparación con mes anterior

### 4.4 Backend - Endpoints de Reportes
**Archivos a crear/modificar**:
- `apps/backend/src/ai/ai.controller.ts`
- `apps/backend/src/ai/ai.service.ts`
- `apps/web/src/server/api/routers/ai.ts`

**Tareas**:
- [ ] Endpoint: `ai.generateTaskReport(taskId)` - generar reporte de tarea
- [ ] Endpoint: `ai.generateWeeklyReport()` - generar reporte semanal
- [ ] Endpoint: `ai.generateMonthlyReport()` - generar reporte mensual
- [ ] Endpoint: `ai.getReports(scope?, limit?)` - listar reportes
- [ ] Endpoint: `ai.getReport(reportId)` - obtener reporte específico

### 4.5 Backend - Jobs Automáticos (Opcional)
**Archivos a crear**:
- `apps/backend/src/jobs/reports.scheduler.ts`

**Tareas**:
- [ ] Instalar: `npm install @nestjs/schedule`
- [ ] Configurar CronJob para reportes semanales (domingo 20:00)
- [ ] Configurar CronJob para reportes mensuales (último día del mes)
- [ ] Enviar notificación al usuario cuando reporte esté listo

### 4.6 Frontend - Vista de Reportes
**Archivos a crear**:
- `apps/web/src/app/(pages)/reports/page.tsx`
- `apps/web/src/components/ai/report-card.tsx`
- `apps/web/src/components/ai/report-detail.tsx`
- `apps/web/src/components/ai/generate-report-dialog.tsx`

**Tareas**:
- [ ] **ReportCard**
  - Muestra resumen del reporte
  - Scope badge (Task / Weekly / Monthly)
  - Productivity score con gauge
  - Fecha de generación
  - Click para ver detalle
- [ ] **ReportDetail**
  - Vista completa del reporte
  - Summary en formato markdown
  - Lista de strengths (con iconos verdes)
  - Lista de weaknesses (con iconos rojos)
  - Lista de recommendations (con iconos azules)
  - Patterns detectados
  - Gráfico del metricsSnapshot
- [ ] **GenerateReportDialog**
  - Botón "Generar Reporte"
  - Selector de scope
  - Si es TASK, selector de tarea
  - Loader mientras genera
  - Muestra reporte al completar
- [ ] **Página de Reportes**
  - Lista de todos los reportes
  - Filtros por scope
  - Ordenar por fecha
  - Botón para generar nuevo reporte

---

## FASE 5: Features Avanzadas (Futuro) 🚀

### 5.1 Notificaciones Inteligentes
- [ ] Recordatorio en peak hours: "Es tu mejor hora, ¿quieres trabajar?"
- [ ] Sugerencia de break: "Has trabajado X horas sin descanso"
- [ ] Alerta de baja productividad: "Tu focus score está bajo hoy"

### 5.2 Comparaciones y Tendencias
- [ ] Comparar semana actual vs semana anterior
- [ ] Comparar mes actual vs mes anterior
- [ ] Gráfico de tendencia de productividad (últimos 3 meses)
- [ ] Predicción de productividad futura

### 5.3 Gamificación
- [ ] Streaks: días consecutivos trabajando
- [ ] Achievements: badges por hitos
- [ ] Leaderboard (si workspace compartido)

### 5.4 Exportación de Datos
- [ ] Exportar reportes a PDF
- [ ] Exportar TimeSessions a CSV
- [ ] Exportar métricas a Excel

---

## Dependencias entre Fases

```
FASE 1 (Auto-tracking)
    ↓
FASE 2 (Dashboard) ←─┐
    ↓                │
FASE 3 (AIProfile) ──┘
    ↓
FASE 4 (Reportes IA)
    ↓
FASE 5 (Advanced Features)
```

- **FASE 2** depende de **FASE 1** (necesita datos de métricas)
- **FASE 3** puede trabajarse en paralelo con **FASE 2**
- **FASE 4** requiere **FASE 1**, **FASE 2** y **FASE 3** completas
- **FASE 5** es completamente opcional y modular

---

## Estimaciones de Tiempo

- **FASE 1**: 2-3 días
- **FASE 2**: 3-4 días
- **FASE 3**: 2-3 días
- **FASE 4**: 4-5 días
- **FASE 5**: Variable (1-2 semanas)

**Total estimado**: 11-15 días de desarrollo

---

## Notas Técnicas

### Cálculo de Focus Score
```typescript
focusScore = 1 - (totalPauseTime / (duration - totalPauseTime))
// Ejemplo: 50min trabajo, 10min pausas
// focusScore = 1 - (10/50) = 0.8 (80%)
```

### Formato de PauseData
```json
[
  {
    "startedAt": "2025-11-30T10:15:00Z",
    "endedAt": "2025-11-30T10:20:00Z",
    "duration": 300
  }
]
```

### Estructura de Prompt para Gemini
```
Contexto:
- Usuario: {userName}
- Período: {dateRange}
- Métricas: {metricsSnapshot}

TimeSessions completadas:
{sessions.map(s => formatSession(s))}

AIProfile:
- Peak hours: {peakHours}
- Completion rate: {completionRate}

Genera un reporte de productividad con:
1. Summary (2-3 párrafos)
2. Strengths (3-5 puntos)
3. Weaknesses (3-5 puntos)
4. Recommendations (3-5 puntos)
5. Patterns detectados
6. Productivity score (0-100)

Formato JSON.
```

---

## Checklist de Progreso

### ✅ Completado
- [x] Sistema de Timer base
- [x] TimeSession tracking
- [x] Pause tracking
- [x] Task switching
- [x] UI de Timer
- [x] Notificaciones
- [x] **FASE 1: Auto-tracking de Métricas** ✨
  - [x] UpdateDailyMetricsUseCase
  - [x] CalculateFocusScoreUseCase
  - [x] AnalyticsRepository
  - [x] Integración en TimersService.stop()
  - [x] Endpoints backend (daily, weekly, monthly, range)
  - [x] API client y hooks de React Query
- [x] **FASE 2: Dashboard de Analytics** ✨
  - [x] Instalación de recharts
  - [x] DailyMetricsCard component
  - [x] WeeklyChart component
  - [x] FocusScoreGauge component
  - [x] Página de Analytics con tabs

### 🔄 En Progreso
- [ ] (Ninguna actualmente)

### ⏳ Pendiente
- [ ] Fase 3: AIProfile - Aprendizaje de Patrones
- [ ] Fase 4: Reportes con IA (Gemini)
- [ ] Fase 5: Features avanzadas

---

## Próximo Paso Recomendado

**Iniciar FASE 3: AIProfile - Aprendizaje de Patrones**
- Crear AIProfile entity
- Implementar LearnFromSessionUseCase
- Integrar learning automático al completar sesiones
- Crear componentes de ProductivityInsights y PeakHoursChart
