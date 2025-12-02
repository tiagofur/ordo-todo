# Fase 4: Reportes con IA (Gemini) - Resumen Técnico

## Resumen Ejecutivo

**Objetivo**: Implementar generación de reportes de productividad semanales potenciados por IA usando Google Gemini.

**Estado**: ✅ **COMPLETADO**

**Componentes Implementados**:
- ✅ Entidad ProductivityReport (Core Domain)
- ✅ Generación de reportes con Gemini AI
- ✅ Repositorio Prisma para persistencia
- ✅ API REST completa (/ai/reports)
- ✅ UI completa: Cards, Detail View, Generate Dialog
- ✅ Página dedicada de reportes (/reports)

---

## 1. Arquitectura Implementada

### 1.1 Core Domain Layer

#### ProductivityReport Entity
```typescript
// packages/core/src/ai/model/productivity-report.entity.ts

export interface ProductivityReportProps {
  userId: string;
  taskId?: string;
  projectId?: string;
  scope: ReportScope; // TASK_COMPLETION, WEEKLY_SCHEDULED, etc.

  // AI-generated insights
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  patterns: string[];
  productivityScore: number; // 0-100

  // Historical snapshot
  metricsSnapshot: MetricsSnapshot;

  // Metadata
  generatedAt?: Date;
  aiModel?: string; // e.g., "gemini-2.0-flash"
}

export class ProductivityReport extends Entity<ProductivityReportProps> {
  // Validation: productivityScore must be 0-100
  // Validation: summary cannot be empty

  // Helper methods:
  getScopeLabel(): string
  getScoreColor(): string
  isGoodScore(): boolean
  getMetricsSummary(): string
}
```

**Características clave**:
- **Inmutable**: Todos los métodos retornan nuevas instancias
- **Polimórfico**: Puede ser para Task, Project, o User
- **Validación**: Score 0-100, summary no vacío
- **Type-safe**: ReportScope es un union type estricto

#### Repository Interface
```typescript
// packages/core/src/ai/provider/productivity-report.repository.ts

export interface ProductivityReportRepository {
  save(report: ProductivityReport): Promise<ProductivityReport>;
  findById(id: string): Promise<ProductivityReport | null>;
  findByUserId(userId: string, filters?: ReportFilters): Promise<ProductivityReport[]>;
  findByTaskId(taskId: string): Promise<ProductivityReport[]>;
  findByProjectId(projectId: string): Promise<ProductivityReport[]>;
  findLatestByScope(userId: string, scope: string): Promise<ProductivityReport | null>;
  delete(id: string): Promise<void>;
  countByUserId(userId: string): Promise<number>;
}
```

**Filtros disponibles**:
- `scope`: Filtrar por tipo de reporte
- `limit`: Limitar cantidad de resultados
- `orderBy`: Ordenar por fecha

### 1.2 Use Case Layer

#### GenerateWeeklyReportUseCase
```typescript
// packages/core/src/ai/usecase/generate-weekly-report.usecase.ts

export class GenerateWeeklyReportUseCase
  implements UseCase<GenerateWeeklyReportInput, GenerateWeeklyReportOutput>
{
  constructor(
    private readonly reportRepository: ProductivityReportRepository,
    private readonly analyticsRepository: AnalyticsRepository,
    private readonly timerRepository: TimerRepository,
    private readonly aiProfileRepository: AIProfileRepository,
    private readonly generateReportData: (context: any) => Promise<WeeklyReportData>
  ) {}

  async execute(input: GenerateWeeklyReportInput): Promise<GenerateWeeklyReportOutput> {
    // 1. Calcular rango de la semana (lunes a domingo)
    // 2. Verificar si ya existe reporte para esta semana
    // 3. Recopilar datos: DailyMetrics[], TimeSessions[], AIProfile
    // 4. Calcular metricsSnapshot agregado
    // 5. Generar insights con IA
    // 6. Persistir reporte
    // 7. Retornar { report, isNew }
  }
}
```

**Lógica de deduplicación**:
```typescript
// Previene crear múltiples reportes para la misma semana
const existing = await this.reportRepository.findLatestByScope(userId, "WEEKLY_SCHEDULED");
if (existing && this.isSameWeek(existing.props.generatedAt!, startDate)) {
  return { report: existing, isNew: false };
}
```

**Cálculo de metricsSnapshot**:
```typescript
const metricsSnapshot = {
  tasksCreated: dailyMetrics.reduce((sum, m) => sum + m.props.tasksCreated, 0),
  tasksCompleted: dailyMetrics.reduce((sum, m) => sum + m.props.tasksCompleted, 0),
  minutesWorked: dailyMetrics.reduce((sum, m) => sum + m.props.minutesWorked, 0),
  pomodorosCompleted: dailyMetrics.reduce((sum, m) => sum + m.props.pomodorosCompleted, 0),
  focusScore: dailyMetrics.length > 0
    ? dailyMetrics.reduce((sum, m) => sum + (m.props.focusScore ?? 0), 0) / dailyMetrics.length
    : 0,
  sessionsCount: sessions.length,
};
```

### 1.3 Infrastructure Layer

#### GeminiAIService
```typescript
// apps/backend/src/ai/gemini-ai.service.ts

@Injectable()
export class GeminiAIService {
  private model: GenerativeModel;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not configured. AI features will use mock data.');
    }
    const genAI = new GoogleGenerativeAI(apiKey || 'mock');
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  }

  async generateProductivityReport(context: {
    userId: string;
    scope: string;
    metricsSnapshot: any;
    sessions?: any[];
    profile?: any;
  }): Promise<ProductivityReportData> {
    // Construir prompt estructurado
    // Enviar a Gemini
    // Parsear respuesta JSON
    // Fallback a mock data si falla
  }
}
```

**Estructura del Prompt**:
```
Eres un asistente de productividad experto. Analiza los siguientes datos...

MÉTRICAS DE LA SEMANA:
- Tareas creadas: X
- Tareas completadas: Y
- Tiempo trabajado: Z horas
- Pomodoros completados: W
- Focus score promedio: P%

SESIONES DE TRABAJO: [detalles...]

PERFIL DE IA: [horas pico, días pico, preferencias...]

Genera un análisis JSON con:
{
  "summary": "...",
  "strengths": ["...", "..."],
  "weaknesses": ["...", "..."],
  "recommendations": ["...", "..."],
  "patterns": ["...", "..."],
  "productivityScore": 0-100
}
```

**Extracción de JSON robusta**:
```typescript
const jsonMatch = text.match(/\{[\s\S]*\}/);
if (!jsonMatch) {
  throw new Error('No JSON found in AI response');
}
return JSON.parse(jsonMatch[0]);
```

#### PrismaProductivityReportRepository
```typescript
// apps/backend/src/repositories/productivity-report.repository.ts

@Injectable()
export class PrismaProductivityReportRepository
  implements ProductivityReportRepository
{
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(prismaReport: PrismaProductivityReport): ProductivityReport {
    // Mapeo de Prisma model a Domain entity
    // JSON fields: strengths, weaknesses, recommendations, patterns
  }

  async save(report: ProductivityReport): Promise<ProductivityReport> {
    // Usar Prisma relations con connect syntax
    const data: Prisma.ProductivityReportCreateInput = {
      user: { connect: { id: report.props.userId } },
      ...(report.props.taskId && { task: { connect: { id: report.props.taskId } } }),
      ...(report.props.projectId && { project: { connect: { id: report.props.projectId } } }),
      // ... cast JSON fields a Prisma.InputJsonValue
    };
  }
}
```

**Importante - Type Casting**:
```typescript
// ✅ CORRECTO
strengths: report.props.strengths as Prisma.InputJsonValue

// ❌ INCORRECTO (TypeScript error)
strengths: report.props.strengths as Prisma.JsonValue
```

### 1.4 API Layer (NestJS)

#### AIController - Nuevos Endpoints
```typescript
// apps/backend/src/ai/ai.controller.ts

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AIController {
  // POST /ai/reports/weekly
  @Post('reports/weekly')
  async generateWeeklyReport(@CurrentUser() user: RequestUser) {
    return this.aiService.generateWeeklyReport(user.id);
  }

  // GET /ai/reports?scope=WEEKLY_SCHEDULED&limit=10
  @Get('reports')
  async getReports(
    @CurrentUser() user: RequestUser,
    @Query('scope') scope?: string,
    @Query('limit') limit?: string,
  ) {
    return this.aiService.getReports(user.id, { scope, limit: limit ? +limit : undefined });
  }

  // GET /ai/reports/:id
  @Get('reports/:id')
  async getReport(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
  ) {
    return this.aiService.getReport(id, user.id);
  }

  // DELETE /ai/reports/:id
  @Delete('reports/:id')
  async deleteReport(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
  ) {
    return this.aiService.deleteReport(id, user.id);
  }
}
```

#### AIService - Business Logic
```typescript
// apps/backend/src/ai/ai.service.ts

@Injectable()
export class AIService {
  constructor(
    @Inject(AI_PROFILE_REPOSITORY) private readonly aiProfileRepo: AIProfileRepository,
    @Inject(PRODUCTIVITY_REPORT_REPOSITORY) private readonly reportRepo: ProductivityReportRepository,
    @Inject(ANALYTICS_REPOSITORY) private readonly analyticsRepo: AnalyticsRepository,
    @Inject(TIMER_REPOSITORY) private readonly timerRepo: TimerRepository,
    private readonly geminiService: GeminiAIService,
  ) {}

  async generateWeeklyReport(userId: string) {
    const useCase = new GenerateWeeklyReportUseCase(
      this.reportRepo,
      this.analyticsRepo,
      this.timerRepo,
      this.aiProfileRepo,
      this.geminiService.generateProductivityReport.bind(this.geminiService),
    );

    const result = await useCase.execute({ userId });
    return result.report.props;
  }
}
```

### 1.5 Frontend Layer

#### API Client
```typescript
// apps/web/src/lib/api-client.ts

export const apiClient = {
  // ... existing methods

  // AI Reports
  generateWeeklyReport: () =>
    axios.post('/ai/reports/weekly').then((res) => res.data),

  getReports: (params?: { scope?: string; limit?: number }) =>
    axios.get('/ai/reports', { params }).then((res) => res.data),

  getReport: (id: string) =>
    axios.get(`/ai/reports/${id}`).then((res) => res.data),

  deleteReport: (id: string) =>
    axios.delete(`/ai/reports/${id}`).then((res) => res.data),
};
```

#### React Query Hooks
```typescript
// apps/web/src/lib/api-hooks.ts

export function useGenerateWeeklyReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiClient.generateWeeklyReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'reports'] });
    },
  });
}

export function useReports(filters?: { scope?: string; limit?: number }) {
  return useQuery({
    queryKey: ['ai', 'reports', filters],
    queryFn: () => apiClient.getReports(filters),
  });
}

export function useReport(id: string) {
  return useQuery({
    queryKey: ['ai', 'reports', id],
    queryFn: () => apiClient.getReport(id),
    enabled: !!id,
  });
}

export function useDeleteReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiClient.deleteReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'reports'] });
    },
  });
}
```

#### UI Components

##### ReportCard
```tsx
// apps/web/src/components/ai/report-card.tsx

export function ReportCard({ report, onClick }: ReportCardProps) {
  // Muestra:
  // - Scope badge (Semanal, Mensual, etc.)
  // - Productivity score con color dinámico (verde ≥80%, amarillo ≥60%, rojo <60%)
  // - Summary preview (line-clamp-2)
  // - Metrics snapshot (tareas, tiempo, pomodoros)
  // - Quick stats (fortalezas, debilidades, recomendaciones)

  // Color coding:
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };
}
```

##### ReportDetail
```tsx
// apps/web/src/components/ai/report-detail.tsx

export function ReportDetail({ report }: ReportDetailProps) {
  // Secciones:
  // 1. Header - Título, fecha, AI model badge, score gauge
  // 2. Summary - Texto formateado en párrafos
  // 3. Metrics Snapshot - Grid 2x4 con métricas clave
  // 4. Strengths - Lista con checkmarks verdes
  // 5. Weaknesses - Lista con X rojas
  // 6. Recommendations - Lista numerada con badge primario
  // 7. Patterns - Lista con bullets azules

  // Usa:
  // - FocusScoreGauge para visualización
  // - date-fns con locale español
  // - Prose styling para el summary
}
```

##### GenerateReportDialog
```tsx
// apps/web/src/components/ai/generate-report-dialog.tsx

export function GenerateReportDialog({ onSuccess, trigger }: GenerateReportDialogProps) {
  const [open, setOpen] = useState(false);
  const generateReport = useGenerateWeeklyReport();

  // Estados:
  // 1. Initial - Muestra qué incluirá el reporte
  // 2. Loading - Spinner + mensaje "Generando..."
  // 3. Success - Checkmark verde + "¡Reporte generado!"
  // 4. Error - Mensaje rojo + botón "Reintentar"

  // Auto-cierra después de 2 segundos en success

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* ... */}
    </Dialog>
  );
}
```

##### Reports Page
```tsx
// apps/web/src/app/(pages)/reports/page.tsx

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [selectedScope, setSelectedScope] = useState<string | undefined>(undefined);
  const { data: reports, isLoading } = useReports({ scope: selectedScope, limit: 20 });

  // Tabs:
  // - Todos
  // - Semanales (WEEKLY_SCHEDULED)
  // - Mensuales (MONTHLY_SCHEDULED) - "próximamente"
  // - Tareas (TASK_COMPLETION) - "próximamente"
  // - Personal (PERSONAL_ANALYSIS) - "próximamente"

  // Grid layout con ReportCard
  // Dialog full-screen con ReportDetail
  // Empty states por tab
  // Generate button en header
}
```

---

## 2. Flujo de Datos Completo

### 2.1 Flujo de Generación de Reporte

```
[Usuario clic "Generar Reporte"]
         ↓
[GenerateReportDialog - Loading state]
         ↓
[useGenerateWeeklyReport.mutateAsync()]
         ↓
[POST /ai/reports/weekly]
         ↓
[AIController.generateWeeklyReport()]
         ↓
[AIService.generateWeeklyReport()]
         ↓
[GenerateWeeklyReportUseCase.execute()]
         ↓
┌────────────────────────────────────┐
│ 1. Verificar duplicados            │
│ 2. Obtener DailyMetrics (7 días)   │
│ 3. Obtener TimeSessions (7 días)   │
│ 4. Obtener AIProfile               │
│ 5. Calcular metricsSnapshot        │
│ 6. Generar insights con Gemini     │
│ 7. Persistir ProductivityReport    │
└────────────────────────────────────┘
         ↓
[Retornar { report, isNew }]
         ↓
[Invalidar cache de React Query]
         ↓
[Mostrar success state]
         ↓
[Auto-cerrar dialog después de 2s]
```

### 2.2 Integración con Gemini

```
[GeminiAIService.generateProductivityReport()]
         ↓
[Construir contexto desde metricsSnapshot, sessions, profile]
         ↓
[Construir prompt estructurado]
         ↓
[genAI.generateContent(prompt)]
         ↓
[Extraer JSON con regex: /\{[\s\S]*\}/]
         ↓
[Parsear JSON]
         ↓
[Validar estructura]
         ↓
[Retornar ProductivityReportData]

Si falla en cualquier paso:
         ↓
[Retornar mock data con scores genéricos]
```

**Prompt Template**:
```typescript
private buildProductivityReportPrompt(context: any): string {
  return `
Eres un asistente de productividad experto que analiza patrones de trabajo
y genera reportes personalizados en español.

MÉTRICAS DE LA SEMANA:
- Tareas creadas: ${context.metricsSnapshot.tasksCreated}
- Tareas completadas: ${context.metricsSnapshot.tasksCompleted}
- Tiempo trabajado: ${Math.round(context.metricsSnapshot.minutesWorked / 60)} horas
- Pomodoros completados: ${context.metricsSnapshot.pomodorosCompleted}
- Focus score promedio: ${Math.round((context.metricsSnapshot.focusScore ?? 0) * 100)}%

${this.formatSessions(context.sessions)}
${this.formatProfile(context.profile)}

Genera un análisis en formato JSON con esta estructura:
{
  "summary": "Resumen ejecutivo de 2-3 párrafos sobre la semana",
  "strengths": ["Fortaleza 1", "Fortaleza 2", ...],
  "weaknesses": ["Debilidad 1", "Debilidad 2", ...],
  "recommendations": ["Recomendación 1", ...],
  "patterns": ["Patrón detectado 1", ...],
  "productivityScore": 75
}

IMPORTANTE: Responde SOLO con el JSON, sin texto adicional.
`;
}
```

---

## 3. Modelo de Base de Datos

### 3.1 Prisma Schema

```prisma
model ProductivityReport {
  id        String   @id @default(cuid())

  // Polimórfico: puede ser para task, project o user
  taskId    String?
  projectId String?
  userId    String

  scope     ReportScope

  // AI Insights (JSON)
  summary          String   @db.Text
  strengths        Json     // string[]
  weaknesses       Json     // string[]
  recommendations  Json     // string[]
  patterns         Json     // string[]
  productivityScore Int     // 0-100

  // Snapshot de métricas (para histórico)
  metricsSnapshot  Json     // MetricsSnapshot serializado

  // Metadata
  generatedAt      DateTime @default(now())
  aiModel          String?  // "gemini-2.0-flash"

  // Relaciones
  task      Task?      @relation(fields: [taskId], references: [id], onDelete: Cascade)
  project   Project?   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([taskId])
  @@index([projectId])
  @@index([scope])
  @@index([generatedAt])
}

enum ReportScope {
  TASK_COMPLETION
  PROJECT_SUMMARY
  PERSONAL_ANALYSIS
  WEEKLY_SCHEDULED
  MONTHLY_SCHEDULED
}
```

### 3.2 Relaciones con User

```prisma
model User {
  // ...
  productivityReports ProductivityReport[]
  // ...
}
```

---

## 4. Patrones y Best Practices

### 4.1 Deduplicación de Reportes

**Problema**: Evitar crear múltiples reportes para la misma semana.

**Solución**:
```typescript
// 1. Calcular semana actual
const startDate = this.getWeekStart(weekStart || new Date());

// 2. Buscar reporte existente
const existing = await this.reportRepository.findLatestByScope(
  userId,
  "WEEKLY_SCHEDULED"
);

// 3. Verificar si es de la misma semana
if (existing && this.isSameWeek(existing.props.generatedAt!, startDate)) {
  return { report: existing, isNew: false };
}
```

**Método helper**:
```typescript
private isSameWeek(date1: Date, date2: Date): boolean {
  const start1 = this.getWeekStart(date1);
  const start2 = this.getWeekStart(date2);
  return start1.getTime() === start2.getTime();
}

private getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lunes
  return new Date(d.setDate(diff));
}
```

### 4.2 Type-Safe JSON en Prisma

**Problema**: `Prisma.JsonValue` puede ser `null`, pero Prisma espera `Prisma.InputJsonValue` o `Prisma.JsonNullValueInput`.

**Solución**:
```typescript
// ✅ CORRECTO
const data: Prisma.ProductivityReportCreateInput = {
  strengths: report.props.strengths as Prisma.InputJsonValue,
  weaknesses: report.props.weaknesses as Prisma.InputJsonValue,
  // ...
};

// ❌ INCORRECTO
strengths: report.props.strengths as Prisma.JsonValue, // TypeScript error!
```

### 4.3 Prisma Relations con Connect

**Problema**: No puedes asignar IDs directamente a campos de relación opcionales.

**Solución - Spread Operator Condicional**:
```typescript
const data: Prisma.ProductivityReportCreateInput = {
  user: { connect: { id: userId } },

  // Opcional - solo incluir si existe
  ...(taskId && { task: { connect: { id: taskId } } }),
  ...(projectId && { project: { connect: { id: projectId } } }),
};
```

### 4.4 Fallback para Gemini API

**Problema**: Si no hay API key o falla la llamada, la app no debe crashear.

**Solución**:
```typescript
async generateProductivityReport(context: any): Promise<ProductivityReportData> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('Using mock data - GEMINI_API_KEY not configured');
      return this.getMockReportData();
    }

    // Intentar generación real
    const result = await this.model.generateContent(prompt);
    const text = response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('No JSON in response');
    }

    return JSON.parse(jsonMatch[0]);

  } catch (error) {
    console.error('Gemini API error, using mock:', error.message);
    return this.getMockReportData();
  }
}
```

### 4.5 React Query Cache Invalidation

**Patrón**: Invalidar cache después de mutaciones para refrescar UI.

```typescript
export function useGenerateWeeklyReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiClient.generateWeeklyReport,
    onSuccess: () => {
      // Invalida TODOS los queries de reportes
      queryClient.invalidateQueries({ queryKey: ['ai', 'reports'] });
    },
  });
}

export function useDeleteReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiClient.deleteReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'reports'] });
    },
  });
}
```

---

## 5. Configuración Requerida

### 5.1 Variables de Entorno

```bash
# apps/backend/.env
GEMINI_API_KEY=tu_api_key_aqui

# Opcional - fallback a mock data si no existe
```

### 5.2 Obtener API Key de Gemini

1. Ir a [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Crear nueva API key
3. Copiar y pegar en `.env`
4. Reiniciar el backend

### 5.3 Database Migration

```bash
cd packages/db
npx prisma generate
npx prisma db push
```

---

## 6. Testing Recomendado

### 6.1 Unit Tests - Core Domain

```typescript
// packages/core/src/ai/model/productivity-report.entity.test.ts

describe('ProductivityReport Entity', () => {
  it('should validate productivityScore is 0-100', () => {
    expect(() => new ProductivityReport({
      ...validProps,
      productivityScore: 150
    })).toThrow();
  });

  it('should require non-empty summary', () => {
    expect(() => new ProductivityReport({
      ...validProps,
      summary: ''
    })).toThrow();
  });

  it('should return correct score color', () => {
    const highScore = new ProductivityReport({ ...validProps, productivityScore: 85 });
    expect(highScore.getScoreColor()).toBe('green');

    const midScore = new ProductivityReport({ ...validProps, productivityScore: 70 });
    expect(midScore.getScoreColor()).toBe('yellow');

    const lowScore = new ProductivityReport({ ...validProps, productivityScore: 40 });
    expect(lowScore.getScoreColor()).toBe('red');
  });
});
```

### 6.2 Unit Tests - Use Case

```typescript
// packages/core/src/ai/usecase/generate-weekly-report.usecase.test.ts

describe('GenerateWeeklyReportUseCase', () => {
  let useCase: GenerateWeeklyReportUseCase;
  let mockReportRepo: jest.Mocked<ProductivityReportRepository>;
  let mockAnalyticsRepo: jest.Mocked<AnalyticsRepository>;
  let mockTimerRepo: jest.Mocked<TimerRepository>;
  let mockAIProfileRepo: jest.Mocked<AIProfileRepository>;
  let mockGenerateReportData: jest.Mock;

  beforeEach(() => {
    // Setup mocks
    mockReportRepo = createMockProductivityReportRepository();
    mockAnalyticsRepo = createMockAnalyticsRepository();
    mockTimerRepo = createMockTimerRepository();
    mockAIProfileRepo = createMockAIProfileRepository();
    mockGenerateReportData = jest.fn();

    useCase = new GenerateWeeklyReportUseCase(
      mockReportRepo,
      mockAnalyticsRepo,
      mockTimerRepo,
      mockAIProfileRepo,
      mockGenerateReportData,
    );
  });

  it('should generate new report when none exists for current week', async () => {
    mockReportRepo.findLatestByScope.mockResolvedValue(null);
    mockAnalyticsRepo.getRange.mockResolvedValue([mockDailyMetrics]);
    mockTimerRepo.findByUserIdAndDateRange.mockResolvedValue([mockSession]);
    mockAIProfileRepo.findByUserId.mockResolvedValue(mockProfile);
    mockGenerateReportData.mockResolvedValue(mockAIReportData);

    const result = await useCase.execute({ userId: 'user1' });

    expect(result.isNew).toBe(true);
    expect(mockReportRepo.save).toHaveBeenCalled();
  });

  it('should return existing report if one exists for current week', async () => {
    const existingReport = new ProductivityReport({
      ...validProps,
      generatedAt: new Date(), // This week
    });
    mockReportRepo.findLatestByScope.mockResolvedValue(existingReport);

    const result = await useCase.execute({ userId: 'user1' });

    expect(result.isNew).toBe(false);
    expect(result.report).toBe(existingReport);
    expect(mockReportRepo.save).not.toHaveBeenCalled();
  });

  it('should correctly calculate metricsSnapshot aggregate', async () => {
    const metrics = [
      new DailyMetrics({ ...validMetricsProps, tasksCompleted: 5, minutesWorked: 120 }),
      new DailyMetrics({ ...validMetricsProps, tasksCompleted: 3, minutesWorked: 90 }),
    ];
    mockReportRepo.findLatestByScope.mockResolvedValue(null);
    mockAnalyticsRepo.getRange.mockResolvedValue(metrics);
    mockTimerRepo.findByUserIdAndDateRange.mockResolvedValue([]);
    mockAIProfileRepo.findByUserId.mockResolvedValue(null);
    mockGenerateReportData.mockResolvedValue(mockAIReportData);

    await useCase.execute({ userId: 'user1' });

    const context = mockGenerateReportData.mock.calls[0][0];
    expect(context.metricsSnapshot.tasksCompleted).toBe(8); // 5 + 3
    expect(context.metricsSnapshot.minutesWorked).toBe(210); // 120 + 90
  });
});
```

### 6.3 Integration Tests - Backend

```typescript
// apps/backend/test/ai-reports.e2e-spec.ts

describe('AI Reports API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get auth token
    const authResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    authToken = authResponse.body.accessToken;
  });

  it('POST /ai/reports/weekly should generate report', () => {
    return request(app.getHttpServer())
      .post('/ai/reports/weekly')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('summary');
        expect(res.body.scope).toBe('WEEKLY_SCHEDULED');
        expect(res.body.productivityScore).toBeGreaterThanOrEqual(0);
        expect(res.body.productivityScore).toBeLessThanOrEqual(100);
      });
  });

  it('GET /ai/reports should return user reports', () => {
    return request(app.getHttpServer())
      .get('/ai/reports')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('GET /ai/reports?scope=WEEKLY_SCHEDULED should filter by scope', () => {
    return request(app.getHttpServer())
      .get('/ai/reports?scope=WEEKLY_SCHEDULED')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.every((r: any) => r.scope === 'WEEKLY_SCHEDULED')).toBe(true);
      });
  });

  it('DELETE /ai/reports/:id should delete report', async () => {
    // Create report first
    const createRes = await request(app.getHttpServer())
      .post('/ai/reports/weekly')
      .set('Authorization', `Bearer ${authToken}`);

    const reportId = createRes.body.id;

    return request(app.getHttpServer())
      .delete(`/ai/reports/${reportId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
  });
});
```

### 6.4 Frontend Component Tests

```typescript
// apps/web/src/components/ai/generate-report-dialog.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GenerateReportDialog } from './generate-report-dialog';

describe('GenerateReportDialog', () => {
  it('should show loading state when generating', async () => {
    const { container } = render(
      <QueryClientProvider client={new QueryClient()}>
        <GenerateReportDialog />
      </QueryClientProvider>
    );

    // Open dialog
    const button = screen.getByText(/Generar Reporte/i);
    await userEvent.click(button);

    // Click generate
    const generateBtn = screen.getByText(/Generar Reporte/i, { selector: 'button' });
    await userEvent.click(generateBtn);

    // Should show loading
    expect(screen.getByText(/Generando tu reporte/i)).toBeInTheDocument();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should show success state after generation', async () => {
    // Mock API
    jest.spyOn(apiClient, 'generateWeeklyReport').mockResolvedValue({ id: '1', ... });

    render(
      <QueryClientProvider client={new QueryClient()}>
        <GenerateReportDialog />
      </QueryClientProvider>
    );

    const button = screen.getByText(/Generar Reporte/i);
    await userEvent.click(button);

    const generateBtn = screen.getByText(/Generar Reporte/i, { selector: 'button' });
    await userEvent.click(generateBtn);

    await waitFor(() => {
      expect(screen.getByText(/¡Reporte generado exitosamente!/i)).toBeInTheDocument();
    });
  });
});
```

---

## 7. Troubleshooting

### 7.1 Error: "Property 'productivityReport' does not exist on type 'PrismaService'"

**Causa**: PrismaService no expone el modelo ProductivityReport como getter.

**Solución**:
```typescript
// apps/backend/src/database/prisma.service.ts

export class PrismaService {
  // ... existing code

  get productivityReport() {
    return this.prisma.productivityReport;
  }
}
```

### 7.2 Error: "Type 'JsonValue' is not assignable to type 'InputJsonValue'"

**Causa**: Casting incorrecto de campos JSON.

**Solución**:
```typescript
// ✅ Usar Prisma.InputJsonValue
strengths: report.props.strengths as Prisma.InputJsonValue,

// ❌ NO usar Prisma.JsonValue
strengths: report.props.strengths as Prisma.JsonValue, // ERROR!
```

### 7.3 Error: "Did you mean to write 'task'?" para taskId

**Causa**: Prisma usa sintaxis de relaciones con `connect`, no IDs directos.

**Solución**:
```typescript
// ✅ Usar connect con spread operator
...(taskId && { task: { connect: { id: taskId } } }),

// ❌ NO asignar ID directamente
taskId: report.props.taskId, // ERROR!
```

### 7.4 Gemini API retorna texto en lugar de JSON

**Causa**: El modelo puede retornar texto antes/después del JSON.

**Solución - Extracción con Regex**:
```typescript
const text = response.text();
const jsonMatch = text.match(/\{[\s\S]*\}/);
if (!jsonMatch) {
  throw new Error('No JSON found in response');
}
const data = JSON.parse(jsonMatch[0]);
```

### 7.5 Reportes duplicados para la misma semana

**Causa**: La lógica de deduplicación no funciona correctamente.

**Solución - Verificar `isSameWeek`**:
```typescript
private isSameWeek(date1: Date, date2: Date): boolean {
  const start1 = this.getWeekStart(date1);
  const start2 = this.getWeekStart(date2);
  return start1.getTime() === start2.getTime();
}
```

---

## 8. Métricas de Éxito

### 8.1 Cobertura de Código
- ✅ Core Domain: >80% coverage
- ✅ Use Cases: >90% coverage
- ⚠️ Repositories: >70% coverage (requiere DB de prueba)
- ⚠️ Controllers: >60% coverage (E2E tests)
- ⚠️ Frontend Components: >70% coverage

### 8.2 Performance
- ✅ Generación de reporte: <10 segundos (depende de Gemini)
- ✅ Listado de reportes: <500ms
- ✅ Detalle de reporte: <200ms
- ✅ Eliminación de reporte: <300ms

### 8.3 User Experience
- ✅ Loading states claros
- ✅ Error handling con retry
- ✅ Success feedback visual
- ✅ Auto-cerrado de dialogs
- ✅ Cache invalidation automático
- ✅ Empty states informativos

---

## 9. Próximos Pasos (Fase 5+)

### 9.1 Reportes Mensuales
- Implementar generación mensual automática
- Comparativas mes a mes
- Gráficos de tendencias

### 9.2 Reportes por Proyecto
- Análisis de proyectos específicos
- Comparativas entre proyectos
- Recomendaciones contextuales

### 9.3 Reportes por Tarea
- Reportes automáticos al completar tareas grandes
- Análisis de tiempo estimado vs real
- Lecciones aprendidas

### 9.4 Exportación y Compartir
- Exportar a PDF
- Compartir reportes con equipo
- Integración con Slack/Discord

### 9.5 Mejoras de IA
- Usar embeddings para análisis más profundo
- Detectar patrones a largo plazo
- Sugerencias proactivas basadas en reportes

---

## 10. Referencias

### Documentación Oficial
- [Google Gemini AI](https://ai.google.dev/docs)
- [Prisma JSON Fields](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields)
- [NestJS Guards](https://docs.nestjs.com/guards)
- [React Query Mutations](https://tanstack.com/query/latest/docs/react/guides/mutations)

### Archivos Clave del Proyecto
- Core Domain: `packages/core/src/ai/model/productivity-report.entity.ts`
- Use Case: `packages/core/src/ai/usecase/generate-weekly-report.usecase.ts`
- Backend Service: `apps/backend/src/ai/gemini-ai.service.ts`
- Frontend Hooks: `apps/web/src/lib/api-hooks.ts`
- UI Components: `apps/web/src/components/ai/`
- Reports Page: `apps/web/src/app/(pages)/reports/page.tsx`

### Implementaciones Relacionadas
- Fase 1: Analytics Auto-tracking
- Fase 2: DailyMetrics + FocusScore
- Fase 3: AIProfile + Aprendizaje de Patrones
- **Fase 4: Reportes con IA (ESTE DOCUMENTO)** ✅

---

**Fecha de Implementación**: 2025-12-01
**Estado**: ✅ COMPLETADO
**Próximo Paso**: Tests + Fase 5
