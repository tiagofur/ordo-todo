import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import type {
  ParsedTaskResult,
  ChatResponse,
  WellbeingIndicators,
  WorkflowSuggestion,
  ChatMessageDto,
} from './dto/ai-chat.dto';

export interface ProductivityReportData {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  patterns: string[];
  productivityScore: number; // 0-100
}

type ModelComplexity = 'low' | 'medium' | 'high';

@Injectable()
export class GeminiAIService {
  private readonly logger = new Logger(GeminiAIService.name);
  private genAI: GoogleGenerativeAI;
  private flashModel: GenerativeModel;
  private proModel: GenerativeModel;

  // Cost tracking (for logging/monitoring)
  private requestCounts = {
    flash: 0,
    pro: 0,
  };

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (!apiKey) {
      this.logger.warn(
        'GEMINI_API_KEY not configured. AI features will be limited.',
      );
      return;
    }

    this.genAI = new GoogleGenerativeAI(apiKey);

    // Flash model for quick, simple tasks (cheaper)
    this.flashModel = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
    });

    // Pro model for complex analysis (more capable but costlier)
    this.proModel = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
    });
  }

  /**
   * Select appropriate model based on task complexity
   * FLASH: Simple parsing, quick chat, duration estimates
   * PRO: Complex reports, wellbeing analysis, nuanced understanding
   */
  private selectModel(complexity: ModelComplexity): GenerativeModel {
    if (complexity === 'high') {
      this.requestCounts.pro++;
      this.logger.debug(`Using PRO model (total: ${this.requestCounts.pro})`);
      return this.proModel || this.flashModel;
    }
    this.requestCounts.flash++;
    this.logger.debug(`Using FLASH model (total: ${this.requestCounts.flash})`);
    return this.flashModel;
  }

  /**
   * Check if AI is available
   */
  isAvailable(): boolean {
    return !!this.flashModel;
  }

  // ============ AI CHAT ============

  /**
   * AI Chat with function calling capabilities
   * Uses FLASH for quick responses, PRO for complex queries
   */
  async chat(
    message: string,
    history: ChatMessageDto[] = [],
    context?: { workspaceId?: string; projectId?: string; tasks?: any[] },
  ): Promise<ChatResponse> {
    if (!this.flashModel) {
      return {
        message: 'El servicio de IA no está disponible. Configura GEMINI_API_KEY.',
        actions: [],
      };
    }

    try {
      // Determine complexity based on message
      const isComplex = message.length > 200 || history.length > 5;
      const model = this.selectModel(isComplex ? 'medium' : 'low');

      const systemPrompt = `Eres un asistente de productividad inteligente para una app de gestión de tareas llamada Ordo-Todo.
Tu rol es ayudar al usuario a:
1. Crear tareas a partir de lenguaje natural
2. Organizar su trabajo de manera eficiente
3. Responder preguntas sobre productividad

IMPORTANTE: Cuando el usuario quiera crear una tarea, responde con un JSON en este formato:
{
  "message": "Tu respuesta amigable al usuario",
  "actions": [
    {
      "type": "CREATE_TASK",
      "data": {
        "title": "Título de la tarea",
        "description": "Descripción opcional",
        "dueDate": "2024-12-07T15:00:00Z",
        "priority": "MEDIUM"
      }
    }
  ],
  "suggestions": ["Sugerencia 1", "Sugerencia 2"]
}

Si no hay acciones, usa: "actions": []

${context?.tasks ? `Tareas actuales del usuario: ${JSON.stringify(context.tasks.slice(0, 5))}` : ''}

Responde siempre en español y sé conciso pero amigable.`;

      const historyText = history
        .map((h) => `${h.role === 'user' ? 'Usuario' : 'Asistente'}: ${h.content}`)
        .join('\n');

      const prompt = `${systemPrompt}\n\nHistorial:\n${historyText}\n\nUsuario: ${message}\n\nResponde en formato JSON:`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        return {
          message: data.message || text,
          actions: data.actions || [],
          suggestions: data.suggestions || [],
        };
      }

      return {
        message: text,
        actions: [],
      };
    } catch (error) {
      this.logger.error('Chat failed', error);
      return {
        message: 'Lo siento, hubo un error procesando tu mensaje. Intenta de nuevo.',
        actions: [],
      };
    }
  }

  // ============ NATURAL LANGUAGE TASK PARSING ============

  /**
   * Parse natural language into structured task data
   * Uses FLASH for quick parsing
   */
  async parseNaturalLanguageTask(
    input: string,
    timezone = 'America/Mexico_City',
  ): Promise<ParsedTaskResult> {
    if (!this.flashModel) {
      return this.extractTaskLocally(input);
    }

    try {
      const model = this.selectModel('low');
      const now = new Date().toISOString();

      const prompt = `Eres un parser de tareas. Extrae información estructurada de este texto.

Texto: "${input}"
Fecha/hora actual: ${now}
Zona horaria: ${timezone}

Responde SOLO con JSON válido:
{
  "title": "Título claro y conciso",
  "description": "Descripción adicional si la hay",
  "dueDate": "ISO date string o null",
  "priority": "LOW | MEDIUM | HIGH | URGENT",
  "estimatedMinutes": número o null,
  "tags": ["etiqueta1", "etiqueta2"],
  "confidence": "LOW | MEDIUM | HIGH",
  "reasoning": "Breve explicación de cómo interpretaste el texto"
}

Ejemplos:
- "Revisar PR mañana a las 3pm" → dueDate sería mañana a las 15:00
- "Tarea urgente: llamar al cliente" → priority: URGENT
- "Estudiar por 2 horas" → estimatedMinutes: 120`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        return {
          title: data.title || input,
          description: data.description,
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
          priority: data.priority || 'MEDIUM',
          estimatedMinutes: data.estimatedMinutes,
          tags: data.tags || [],
          confidence: data.confidence || 'MEDIUM',
          reasoning: data.reasoning || 'Parseado por IA',
        };
      }

      throw new Error('Invalid JSON response');
    } catch (error) {
      this.logger.error('Failed to parse task', error);
      return this.extractTaskLocally(input);
    }
  }

  /**
   * Local fallback for task parsing without AI
   */
  private extractTaskLocally(input: string): ParsedTaskResult {
    // Simple local parsing
    const urgentKeywords = ['urgente', 'asap', 'ya', 'inmediato'];
    const highKeywords = ['importante', 'prioridad', 'crítico'];
    const lowKeywords = ['cuando puedas', 'opcional', 'si tienes tiempo'];

    let priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'MEDIUM';
    const lowerInput = input.toLowerCase();

    if (urgentKeywords.some((k) => lowerInput.includes(k))) priority = 'URGENT';
    else if (highKeywords.some((k) => lowerInput.includes(k))) priority = 'HIGH';
    else if (lowKeywords.some((k) => lowerInput.includes(k))) priority = 'LOW';

    // Extract time estimates
    let estimatedMinutes: number | undefined;
    const timeMatch = input.match(/(\d+)\s*(hora|hr|h|minuto|min|m)/i);
    if (timeMatch) {
      const value = parseInt(timeMatch[1], 10);
      const unit = timeMatch[2].toLowerCase();
      estimatedMinutes = unit.startsWith('h') ? value * 60 : value;
    }

    return {
      title: input.substring(0, 100),
      priority,
      estimatedMinutes,
      tags: [],
      confidence: 'LOW',
      reasoning: 'Parsing local sin IA - configure GEMINI_API_KEY para mejor precisión',
    };
  }

  // ============ WELLBEING ANALYSIS ============

  /**
   * Analyze user wellbeing based on work patterns
   * Uses PRO model for nuanced, sensitive analysis
   */
  async analyzeWellbeing(metrics: {
    dailyMetrics: any[];
    sessions: any[];
    profile: any;
  }): Promise<WellbeingIndicators> {
    // Calculate metrics locally first to reduce API calls
    const localMetrics = this.calculateWellbeingMetricsLocally(metrics);

    // If PRO model not available, return local metrics only
    if (!this.proModel) {
      return {
        ...localMetrics,
        insights: ['Análisis local - configura GEMINI_API_KEY para insights de IA'],
        recommendations: ['Mantén un balance saludable entre trabajo y descanso'],
      };
    }

    try {
      const model = this.selectModel('high');

      const prompt = `Eres un coach de bienestar laboral. Analiza estos patrones de trabajo y proporciona insights sensibles sobre el bienestar del usuario.

Métricas:
- Promedio horas/día: ${localMetrics.metrics.avgHoursPerDay}
- Promedio sesiones/día: ${localMetrics.metrics.avgSessionsPerDay}
- Trabajo en fines de semana: ${localMetrics.metrics.weekendWorkPercentage}%
- Trabajo nocturno (después 22:00): ${localMetrics.metrics.lateNightWorkPercentage}%
- Racha más larga: ${localMetrics.metrics.longestStreak} días

Scores calculados:
- Riesgo de burnout: ${localMetrics.burnoutRisk}
- Balance trabajo-vida: ${localMetrics.workLifeBalance}/100
- Calidad de enfoque: ${localMetrics.focusQuality}/100

Responde con JSON:
{
  "insights": ["insight 1", "insight 2", "insight 3"],
  "recommendations": ["recomendación 1", "recomendación 2", "recomendación 3"]
}

Sé empático, constructivo y evita ser alarmista. Usa español.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        return {
          ...localMetrics,
          insights: data.insights || [],
          recommendations: data.recommendations || [],
        };
      }

      throw new Error('Invalid response');
    } catch (error) {
      this.logger.error('Wellbeing analysis failed', error);
      return {
        ...localMetrics,
        insights: ['No se pudo completar el análisis de IA'],
        recommendations: ['Toma descansos regulares durante tu jornada laboral'],
      };
    }
  }

  /**
   * Calculate wellbeing metrics locally without API
   */
  private calculateWellbeingMetricsLocally(metrics: {
    dailyMetrics: any[];
    sessions: any[];
    profile: any;
  }): Omit<WellbeingIndicators, 'insights' | 'recommendations'> {
    const { dailyMetrics, sessions } = metrics;

    // Calculate averages
    const totalMinutes = dailyMetrics.reduce((sum, d) => sum + (d.minutesWorked || 0), 0);
    const daysWithWork = dailyMetrics.filter((d) => d.minutesWorked > 0).length || 1;
    const avgHoursPerDay = (totalMinutes / daysWithWork / 60);

    const avgSessionsPerDay = sessions.length / Math.max(daysWithWork, 1);

    // Weekend work
    const weekendSessions = sessions.filter((s) => {
      const day = new Date(s.startedAt).getDay();
      return day === 0 || day === 6;
    });
    const weekendWorkPercentage = (weekendSessions.length / Math.max(sessions.length, 1)) * 100;

    // Late night work (after 10pm)
    const lateNightSessions = sessions.filter((s) => {
      const hour = new Date(s.startedAt).getHours();
      return hour >= 22 || hour < 6;
    });
    const lateNightWorkPercentage = (lateNightSessions.length / Math.max(sessions.length, 1)) * 100;

    // Calculate scores
    let burnoutRisk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (avgHoursPerDay > 10 || weekendWorkPercentage > 40 || lateNightWorkPercentage > 30) {
      burnoutRisk = 'HIGH';
    } else if (avgHoursPerDay > 8 || weekendWorkPercentage > 20 || lateNightWorkPercentage > 15) {
      burnoutRisk = 'MEDIUM';
    }

    const workLifeBalance = Math.max(0, Math.min(100,
      100 - (weekendWorkPercentage * 0.5) - (lateNightWorkPercentage * 0.5) - Math.max(0, (avgHoursPerDay - 8) * 10)
    ));

    const completedSessions = sessions.filter((s) => s.wasCompleted).length;
    const focusQuality = Math.round((completedSessions / Math.max(sessions.length, 1)) * 100);

    // Consistency score based on daily variance
    const consistencyScore = Math.min(100, Math.max(0, 100 - (daysWithWork < 3 ? 50 : 0)));

    // Overall score
    const overallScore = Math.round(
      (workLifeBalance * 0.3 + focusQuality * 0.4 + consistencyScore * 0.3)
    );

    return {
      overallScore,
      burnoutRisk,
      workLifeBalance: Math.round(workLifeBalance),
      focusQuality,
      consistencyScore,
      metrics: {
        avgHoursPerDay: Math.round(avgHoursPerDay * 10) / 10,
        avgSessionsPerDay: Math.round(avgSessionsPerDay * 10) / 10,
        longestStreak: dailyMetrics.filter((d) => d.tasksCompleted > 0).length,
        weekendWorkPercentage: Math.round(weekendWorkPercentage),
        lateNightWorkPercentage: Math.round(lateNightWorkPercentage),
      },
    };
  }

  // ============ WORKFLOW SUGGESTIONS ============

  /**
   * Suggest workflow/phases for a project
   * Uses FLASH for quick suggestions
   */
  async suggestWorkflow(
    projectName: string,
    projectDescription?: string,
    objectives?: string,
  ): Promise<WorkflowSuggestion> {
    if (!this.flashModel) {
      return this.getDefaultWorkflowSuggestion(projectName);
    }

    try {
      const model = this.selectModel('low');

      const prompt = `Eres un Project Manager experto. Sugiere un flujo de trabajo para este proyecto:

Proyecto: ${projectName}
${projectDescription ? `Descripción: ${projectDescription}` : ''}
${objectives ? `Objetivos: ${objectives}` : ''}

Responde con JSON:
{
  "phases": [
    {
      "name": "Fase 1: Planificación",
      "description": "Descripción breve",
      "suggestedTasks": [
        { "title": "Tarea 1", "description": "...", "estimatedMinutes": 60, "priority": "HIGH" }
      ]
    }
  ],
  "estimatedDuration": "2 semanas",
  "tips": ["tip 1", "tip 2"]
}

Limita a 3-4 fases con 3-5 tareas cada una. Usa español.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error('Invalid response');
    } catch (error) {
      this.logger.error('Workflow suggestion failed', error);
      return this.getDefaultWorkflowSuggestion(projectName);
    }
  }

  /**
   * Default workflow template when AI is unavailable
   */
  private getDefaultWorkflowSuggestion(projectName: string): WorkflowSuggestion {
    return {
      phases: [
        {
          name: 'Planificación',
          description: 'Definir objetivos y alcance',
          suggestedTasks: [
            { title: 'Definir objetivos del proyecto', priority: 'HIGH', estimatedMinutes: 60 },
            { title: 'Identificar stakeholders', priority: 'MEDIUM', estimatedMinutes: 30 },
          ],
        },
        {
          name: 'Ejecución',
          description: 'Desarrollo principal',
          suggestedTasks: [
            { title: `Implementar ${projectName}`, priority: 'HIGH', estimatedMinutes: 120 },
          ],
        },
        {
          name: 'Revisión',
          description: 'Validación y ajustes',
          suggestedTasks: [
            { title: 'Revisar entregables', priority: 'HIGH', estimatedMinutes: 60 },
            { title: 'Documentar resultados', priority: 'MEDIUM', estimatedMinutes: 45 },
          ],
        },
      ],
      estimatedDuration: 'Depende del alcance',
      tips: [
        'Divide las tareas grandes en subtareas más manejables',
        'Establece fechas límite realistas',
        'Comunica el progreso regularmente',
      ],
    };
  }

  // ============ PRODUCTIVITY REPORTS ============

  /**
   * Generate a productivity report based on metrics and sessions
   * Uses FLASH for weekly, PRO for monthly
   */
  async generateProductivityReport(context: {
    userId: string;
    scope: 'TASK_COMPLETION' | 'WEEKLY_SCHEDULED' | 'MONTHLY_SCHEDULED' | 'PROJECT_SUMMARY';
    metricsSnapshot: any;
    sessions?: any[];
    profile?: any;
    projectName?: string;
  }): Promise<ProductivityReportData> {
    const complexity: ModelComplexity = context.scope === 'MONTHLY_SCHEDULED' ? 'high' : 'medium';
    const model = this.selectModel(complexity);

    if (!model) {
      return this.getMockReport(context.scope);
    }

    try {
      const prompt = this.buildProductivityReportPrompt(context);
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        return {
          summary: data.summary || '',
          strengths: data.strengths || [],
          weaknesses: data.weaknesses || [],
          recommendations: data.recommendations || [],
          patterns: data.patterns || [],
          productivityScore: Math.min(
            100,
            Math.max(0, data.productivityScore || 50),
          ),
        };
      }

      throw new Error('Failed to parse AI response');
    } catch (error) {
      this.logger.error('Failed to generate productivity report', error);
      return this.getMockReport(context.scope);
    }
  }

  /**
   * Build the prompt for Gemini based on context
   */
  private buildProductivityReportPrompt(context: any): string {
    const { scope, metricsSnapshot, sessions, profile, projectName } = context;

    let prompt = `You are an AI productivity coach analyzing user work patterns. Generate a productivity report in JSON format.

Context:
- Report Scope: ${scope}
- Period: ${this.getScopePeriod(scope)}
${projectName ? `- Project: ${projectName}` : ''}
- Metrics: ${JSON.stringify(metricsSnapshot, null, 2)}
`;

    if (sessions && sessions.length > 0) {
      prompt += `\nRecent Work Sessions (${sessions.length} total):
${sessions
          .slice(0, 10)
          .map(
            (s: any, i: number) =>
              `  ${i + 1}. Duration: ${s.duration}min, Pauses: ${s.pauseCount || 0}, Completed: ${s.wasCompleted ? 'Yes' : 'No'}`,
          )
          .join('\n')}
`;
    }

    if (profile) {
      const peakHours = Object.entries(profile.peakHours || {})
        .sort(([, a]: any, [, b]: any) => b - a)
        .slice(0, 3)
        .map(([hour]) => hour);

      prompt += `\nUser's Productivity Profile:
- Peak Hours: ${peakHours.join(', ')}
- Average Task Duration: ${profile.avgTaskDuration || 30} minutes
- Completion Rate: ${Math.round((profile.completionRate || 0.7) * 100)}%
`;
    }

    prompt += `\n
Generate a JSON report with the following structure:
{
  "summary": "2-3 paragraphs analyzing the user's productivity during this period",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "patterns": ["pattern 1", "pattern 2"],
  "productivityScore": 75 (0-100, based on metrics and completion rates)
}

Be specific, actionable, and positive. Focus on helping the user improve. Use Spanish language for the content.`;

    return prompt;
  }

  private getScopePeriod(scope: string): string {
    switch (scope) {
      case 'TASK_COMPLETION':
        return 'Individual Task';
      case 'WEEKLY_SCHEDULED':
        return 'Last 7 days';
      case 'MONTHLY_SCHEDULED':
        return 'Last 30 days';
      case 'PROJECT_SUMMARY':
        return 'Project Duration';
      default:
        return 'Unknown';
    }
  }

  async estimateTaskDuration(taskTitle: string, taskDescription?: string, avgDuration = 30): Promise<{ estimatedMinutes: number; confidence: string; reasoning: string }> {
    if (!this.flashModel) {
      return {
        estimatedMinutes: avgDuration,
        confidence: 'LOW',
        reasoning: 'Estimación basada en promedio histórico (Modo Offline).'
      };
    }

    try {
      const model = this.selectModel('low');

      const prompt = `
        Actúa como un experto Project Manager. Estima la duración en minutos para la siguiente tarea:
        Título: "${taskTitle}"
        ${taskDescription ? `Descripción: "${taskDescription}"` : ''}
        
        Duración promedio de tareas de este usuario: ${avgDuration} minutos.
        
        Responde SOLO con un objeto JSON: { "estimatedMinutes": number, "confidence": "LOW" | "MEDIUM" | "HIGH", "reasoning": "Breve explicación en español" }
        `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        return {
          estimatedMinutes: data.estimatedMinutes || avgDuration,
          confidence: data.confidence || 'LOW',
          reasoning: data.reasoning || 'Estimación automática generada por IA.'
        };
      }
      throw new Error("Invalid format");
    } catch (e) {
      this.logger.error("Failed to estimate duration", e);
      return {
        estimatedMinutes: avgDuration,
        confidence: 'LOW',
        reasoning: 'Fallo en servicio de IA, usando promedio histórico.'
      };
    }
  }

  /**
   * Fallback mock report when Gemini is not available
   */
  private getMockReport(scope: string): ProductivityReportData {
    return {
      summary: `Reporte ${scope} generado en modo de desarrollo. Configura GEMINI_API_KEY para obtener insights reales de IA.`,
      strengths: [
        'Mantuviste un ritmo constante de trabajo',
        'Completaste varias sesiones exitosamente',
      ],
      weaknesses: ['Se detectaron algunas interrupciones en tus sesiones'],
      recommendations: [
        'Intenta reducir las pausas durante las sesiones de trabajo',
        'Programa tus tareas más importantes durante tus horas pico',
      ],
      patterns: ['Trabajas mejor en bloques de 25-30 minutos'],
      productivityScore: 70,
    };
  }

  /**
   * Get current model usage stats (for monitoring/debugging)
   */
  getModelStats() {
    return {
      ...this.requestCounts,
      estimatedCostSavings: `${Math.round((this.requestCounts.flash / Math.max(this.requestCounts.flash + this.requestCounts.pro, 1)) * 100)}% requests using cheaper Flash model`,
    };
  }
}
