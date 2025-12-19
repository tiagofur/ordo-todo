import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { GeminiAIService } from '../ai/gemini-ai.service';

/**
 * Search result item
 */
export interface SearchResult {
  id: string;
  type: 'task' | 'project' | 'note' | 'comment' | 'habit';
  title: string;
  description?: string;
  relevanceScore: number;
  highlights: string[];
  metadata: {
    status?: string;
    priority?: string;
    dueDate?: Date;
    projectName?: string;
    createdAt?: Date;
  };
}

/**
 * Search options
 */
export interface SearchOptions {
  types?: Array<'task' | 'project' | 'note' | 'comment' | 'habit'>;
  projectId?: string;
  workspaceId?: string;
  limit?: number;
  includeCompleted?: boolean;
  dateRange?: {
    from?: Date;
    to?: Date;
  };
}

/**
 * Smart search interpretation
 */
export interface SearchInterpretation {
  originalQuery: string;
  intent: 'find' | 'filter' | 'aggregate' | 'compare';
  entities: {
    keywords: string[];
    dates?: string[];
    priorities?: string[];
    statuses?: string[];
    projects?: string[];
  };
  suggestedFilters: {
    priority?: string;
    status?: string;
    dateRange?: { from: string; to: string };
  };
  explanation: string;
}

@Injectable()
export class SemanticSearchService {
  private readonly logger = new Logger(SemanticSearchService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly geminiAI: GeminiAIService,
  ) {}

  /**
   * Perform a semantic search across all user content
   */
  async search(
    userId: string,
    query: string,
    options: SearchOptions = {},
  ): Promise<{
    results: SearchResult[];
    interpretation: SearchInterpretation;
    totalCount: number;
  }> {
    this.logger.log(`Semantic search: "${query}" for user ${userId}`);

    // First, interpret the query using AI
    const interpretation = await this.interpretQuery(query);

    // Build Prisma filters based on interpretation
    const filters = this.buildFilters(userId, interpretation, options);

    // Execute searches in parallel
    const searchTypes = options.types || ['task', 'project', 'habit'];
    const searchPromises: Promise<SearchResult[]>[] = [];

    if (searchTypes.includes('task')) {
      searchPromises.push(
        this.searchTasks(userId, interpretation, filters, options),
      );
    }
    if (searchTypes.includes('project')) {
      searchPromises.push(
        this.searchProjects(userId, interpretation, filters, options),
      );
    }
    if (searchTypes.includes('habit')) {
      searchPromises.push(
        this.searchHabits(userId, interpretation, filters, options),
      );
    }

    const resultArrays = await Promise.all(searchPromises);
    const allResults = resultArrays.flat();

    // Sort by relevance score
    allResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Apply limit
    const limit = options.limit || 20;
    const results = allResults.slice(0, limit);

    return {
      results,
      interpretation,
      totalCount: allResults.length,
    };
  }

  /**
   * Interpret a natural language query using AI
   */
  async interpretQuery(query: string): Promise<SearchInterpretation> {
    const systemPrompt = `Eres un parser de búsquedas inteligente. Tu trabajo es interpretar consultas en lenguaje natural para un sistema de gestión de tareas y productividad.

INSTRUCCIONES:
1. Identifica la intención del usuario (buscar, filtrar, agregar, comparar)
2. Extrae palabras clave relevantes
3. Identifica menciones de fechas, prioridades, estados
4. Sugiere filtros basados en la consulta

Responde ÚNICAMENTE con JSON:
{
  "intent": "find|filter|aggregate|compare",
  "entities": {
    "keywords": ["palabra1", "palabra2"],
    "dates": ["hoy", "esta semana"],
    "priorities": ["alta", "urgente"],
    "statuses": ["pendiente", "completada"],
    "projects": ["nombre proyecto"]
  },
  "suggestedFilters": {
    "priority": "HIGH|MEDIUM|LOW|URGENT",
    "status": "TODO|IN_PROGRESS|DONE",
    "dateRange": { "from": "YYYY-MM-DD", "to": "YYYY-MM-DD" }
  },
  "explanation": "Breve explicación de cómo interpretaste la búsqueda"
}`;

    try {
      const response = await this.geminiAI.generate(
        systemPrompt,
        `Query: "${query}"`,
      );
      const jsonMatch = response.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          originalQuery: query,
          intent: parsed.intent || 'find',
          entities: {
            keywords: parsed.entities?.keywords || this.extractKeywords(query),
            dates: parsed.entities?.dates || [],
            priorities: parsed.entities?.priorities || [],
            statuses: parsed.entities?.statuses || [],
            projects: parsed.entities?.projects || [],
          },
          suggestedFilters: parsed.suggestedFilters || {},
          explanation: parsed.explanation || 'Búsqueda por palabras clave',
        };
      }
    } catch (error) {
      this.logger.warn('AI interpretation failed, using fallback', error);
    }

    // Fallback to local parsing
    return this.parseQueryLocally(query);
  }

  /**
   * Local fallback for query parsing
   */
  private parseQueryLocally(query: string): SearchInterpretation {
    const lowerQuery = query.toLowerCase();
    const keywords = this.extractKeywords(query);

    // Detect priorities
    const priorities: string[] = [];
    if (lowerQuery.includes('urgente') || lowerQuery.includes('urgent'))
      priorities.push('URGENT');
    if (lowerQuery.includes('alta') || lowerQuery.includes('importante'))
      priorities.push('HIGH');
    if (lowerQuery.includes('baja') || lowerQuery.includes('opcional'))
      priorities.push('LOW');

    // Detect statuses
    const statuses: string[] = [];
    if (lowerQuery.includes('pendiente') || lowerQuery.includes('por hacer'))
      statuses.push('TODO');
    if (lowerQuery.includes('en progreso') || lowerQuery.includes('trabajando'))
      statuses.push('IN_PROGRESS');
    if (
      lowerQuery.includes('completada') ||
      lowerQuery.includes('terminada') ||
      lowerQuery.includes('hecha')
    )
      statuses.push('DONE');

    // Detect dates
    const dates: string[] = [];
    if (lowerQuery.includes('hoy')) dates.push('hoy');
    if (lowerQuery.includes('mañana')) dates.push('mañana');
    if (lowerQuery.includes('esta semana')) dates.push('esta semana');
    if (lowerQuery.includes('este mes')) dates.push('este mes');
    if (lowerQuery.includes('vencida') || lowerQuery.includes('atrasada'))
      dates.push('overdue');

    return {
      originalQuery: query,
      intent: 'find',
      entities: {
        keywords,
        dates,
        priorities,
        statuses,
        projects: [],
      },
      suggestedFilters: {
        priority: priorities[0],
        status: statuses[0],
      },
      explanation: 'Búsqueda local por palabras clave',
    };
  }

  /**
   * Extract keywords from a query
   */
  private extractKeywords(query: string): string[] {
    const stopWords = new Set([
      'el',
      'la',
      'los',
      'las',
      'un',
      'una',
      'de',
      'del',
      'en',
      'con',
      'para',
      'por',
      'que',
      'qué',
      'como',
      'cómo',
      'donde',
      'dónde',
      'cuando',
      'cuándo',
      'a',
      'y',
      'o',
      'mi',
      'mis',
      'tu',
      'tus',
      'su',
      'sus',
      'buscar',
      'encontrar',
      'mostrar',
      'ver',
      'listar',
      'tareas',
      'tarea',
      'proyecto',
      'proyectos',
    ]);

    return query
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.has(word))
      .slice(0, 10);
  }

  /**
   * Build Prisma filters from interpretation
   */
  private buildFilters(
    userId: string,
    interpretation: SearchInterpretation,
    options: SearchOptions,
  ): any {
    const filters: any = {};

    // Priority filter
    if (interpretation.suggestedFilters.priority) {
      filters.priority = interpretation.suggestedFilters.priority;
    }

    // Status filter
    if (interpretation.suggestedFilters.status) {
      filters.status = interpretation.suggestedFilters.status;
    } else if (!options.includeCompleted) {
      filters.status = { notIn: ['COMPLETED', 'CANCELLED'] };
    }

    // Date range filter
    if (interpretation.entities.dates?.includes('overdue')) {
      filters.dueDate = { lt: new Date() };
    } else if (interpretation.entities.dates?.includes('hoy')) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      filters.dueDate = { gte: today, lt: tomorrow };
    } else if (interpretation.entities.dates?.includes('esta semana')) {
      const today = new Date();
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() + (7 - weekEnd.getDay()));
      filters.dueDate = { gte: today, lte: weekEnd };
    }

    // Project filter
    if (options.projectId) {
      filters.projectId = options.projectId;
    }

    return filters;
  }

  /**
   * Search tasks
   */
  private async searchTasks(
    userId: string,
    interpretation: SearchInterpretation,
    filters: any,
    options: SearchOptions,
  ): Promise<SearchResult[]> {
    const keywords = interpretation.entities.keywords;

    // Build OR conditions for keyword search
    const keywordConditions =
      keywords.length > 0
        ? {
            OR: keywords.flatMap((keyword) => [
              { title: { contains: keyword, mode: 'insensitive' as const } },
              {
                description: {
                  contains: keyword,
                  mode: 'insensitive' as const,
                },
              },
            ]),
          }
        : {};

    const tasks = await this.prisma.task.findMany({
      where: {
        creatorId: userId,
        ...filters,
        ...keywordConditions,
      },
      include: {
        project: { select: { name: true } },
      },
      take: options.limit || 20,
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return tasks.map((task) => ({
      id: task.id,
      type: 'task' as const,
      title: task.title,
      description: task.description || undefined,
      relevanceScore: this.calculateRelevance(
        task.title,
        task.description || '',
        keywords,
      ),
      highlights: this.extractHighlights(
        task.title,
        task.description || '',
        keywords,
      ),
      metadata: {
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate || undefined,
        projectName: task.project?.name,
        createdAt: task.createdAt,
      },
    }));
  }

  /**
   * Search projects
   */
  private async searchProjects(
    userId: string,
    interpretation: SearchInterpretation,
    filters: any,
    options: SearchOptions,
  ): Promise<SearchResult[]> {
    const keywords = interpretation.entities.keywords;

    const keywordConditions =
      keywords.length > 0
        ? {
            OR: keywords.flatMap((keyword) => [
              { name: { contains: keyword, mode: 'insensitive' as const } },
              {
                description: {
                  contains: keyword,
                  mode: 'insensitive' as const,
                },
              },
            ]),
          }
        : {};

    const projects = await this.prisma.project.findMany({
      where: {
        workspace: {
          members: {
            some: { userId },
          },
        },
        ...keywordConditions,
      },
      take: options.limit || 10,
      orderBy: { createdAt: 'desc' },
    });

    return projects.map((project) => ({
      id: project.id,
      type: 'project' as const,
      title: project.name,
      description: project.description || undefined,
      relevanceScore: this.calculateRelevance(
        project.name,
        project.description || '',
        keywords,
      ),
      highlights: this.extractHighlights(
        project.name,
        project.description || '',
        keywords,
      ),
      metadata: {
        status: project.status,
        createdAt: project.createdAt,
      },
    }));
  }

  /**
   * Search habits
   */
  private async searchHabits(
    userId: string,
    interpretation: SearchInterpretation,
    filters: any,
    options: SearchOptions,
  ): Promise<SearchResult[]> {
    const keywords = interpretation.entities.keywords;

    const keywordConditions =
      keywords.length > 0
        ? {
            OR: keywords.flatMap((keyword) => [
              { name: { contains: keyword, mode: 'insensitive' as const } },
              {
                description: {
                  contains: keyword,
                  mode: 'insensitive' as const,
                },
              },
            ]),
          }
        : {};

    const habits = await this.prisma.habit.findMany({
      where: {
        userId,
        ...keywordConditions,
      },
      take: options.limit || 10,
      orderBy: { createdAt: 'desc' },
    });

    return habits.map((habit) => ({
      id: habit.id,
      type: 'habit' as const,
      title: habit.name,
      description: habit.description || undefined,
      relevanceScore: this.calculateRelevance(
        habit.name,
        habit.description || '',
        keywords,
      ),
      highlights: this.extractHighlights(
        habit.name,
        habit.description || '',
        keywords,
      ),
      metadata: {
        createdAt: habit.createdAt,
      },
    }));
  }

  /**
   * Calculate relevance score for a result
   */
  private calculateRelevance(
    title: string,
    description: string,
    keywords: string[],
  ): number {
    if (keywords.length === 0) return 50;

    let score = 0;
    const lowerTitle = title.toLowerCase();
    const lowerDesc = description.toLowerCase();

    for (const keyword of keywords) {
      // Title matches are worth more
      if (lowerTitle.includes(keyword)) {
        score += 30;
        // Exact match or starts with
        if (
          lowerTitle.startsWith(keyword) ||
          lowerTitle.includes(` ${keyword}`)
        ) {
          score += 20;
        }
      }
      // Description matches
      if (lowerDesc.includes(keyword)) {
        score += 15;
      }
    }

    return Math.min(100, score);
  }

  /**
   * Extract highlighted text snippets
   */
  private extractHighlights(
    title: string,
    description: string,
    keywords: string[],
  ): string[] {
    const highlights: string[] = [];

    for (const keyword of keywords) {
      // Check title
      if (title.toLowerCase().includes(keyword)) {
        highlights.push(
          `Título: ...${this.highlightKeyword(title, keyword)}...`,
        );
      }
      // Check description
      if (description && description.toLowerCase().includes(keyword)) {
        const snippet = this.getSnippetAround(description, keyword, 50);
        if (snippet) {
          highlights.push(`...${this.highlightKeyword(snippet, keyword)}...`);
        }
      }
    }

    return highlights.slice(0, 3);
  }

  /**
   * Get a snippet of text around a keyword
   */
  private getSnippetAround(
    text: string,
    keyword: string,
    contextLength: number,
  ): string {
    const lowerText = text.toLowerCase();
    const index = lowerText.indexOf(keyword);
    if (index === -1) return '';

    const start = Math.max(0, index - contextLength);
    const end = Math.min(text.length, index + keyword.length + contextLength);

    return text.substring(start, end);
  }

  /**
   * Highlight a keyword in text (for display)
   */
  private highlightKeyword(text: string, keyword: string): string {
    const regex = new RegExp(`(${keyword})`, 'gi');
    return text.replace(regex, '**$1**');
  }

  /**
   * Get search suggestions based on partial input
   */
  async getSuggestions(
    userId: string,
    partialQuery: string,
  ): Promise<string[]> {
    if (partialQuery.length < 2) return [];

    const suggestions: string[] = [];

    // Get recent task titles that match
    const tasks = await this.prisma.task.findMany({
      where: {
        creatorId: userId,
        title: { contains: partialQuery, mode: 'insensitive' },
      },
      select: { title: true },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    suggestions.push(...tasks.map((t) => t.title));

    // Add common search patterns
    const patterns = [
      `tareas ${partialQuery}`,
      `${partialQuery} pendientes`,
      `${partialQuery} urgentes`,
      `${partialQuery} para hoy`,
    ];

    suggestions.push(...patterns.slice(0, 3));

    return [...new Set(suggestions)].slice(0, 8);
  }

  /**
   * Natural language query for specific data (ask questions)
   */
  async ask(
    userId: string,
    question: string,
  ): Promise<{
    answer: string;
    data?: any;
    type: 'count' | 'list' | 'summary' | 'insight';
  }> {
    this.logger.log(`Ask query: "${question}"`);

    // Get context data
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalTasks, pendingTasks, overdueTasks, completedToday] =
      await Promise.all([
        this.prisma.task.count({ where: { creatorId: userId } }),
        this.prisma.task.count({
          where: {
            creatorId: userId,
            status: { notIn: ['COMPLETED', 'CANCELLED'] },
          },
        }),
        this.prisma.task.count({
          where: {
            creatorId: userId,
            status: { notIn: ['COMPLETED', 'CANCELLED'] },
            dueDate: { lt: new Date() },
          },
        }),
        this.prisma.task.count({
          where: {
            creatorId: userId,
            status: 'COMPLETED',
            completedAt: { gte: today },
          },
        }),
      ]);

    const context = {
      totalTasks,
      pendingTasks,
      overdueTasks,
      completedToday,
    };

    const systemPrompt = `Eres un asistente de productividad que responde preguntas sobre las tareas y datos del usuario.

DATOS DEL USUARIO:
- Total de tareas: ${context.totalTasks}
- Tareas pendientes: ${context.pendingTasks}
- Tareas vencidas: ${context.overdueTasks}
- Completadas hoy: ${context.completedToday}

INSTRUCCIONES:
1. Responde de forma concisa y útil
2. Si la pregunta es sobre cuántas tareas, da el número exacto
3. Ofrece consejos relevantes si aplica
4. Responde en español

Responde con JSON:
{
  "answer": "Tu respuesta aquí",
  "type": "count|list|summary|insight",
  "data": null
}`;

    try {
      const response = await this.geminiAI.generate(
        systemPrompt,
        `Pregunta: "${question}"`,
      );
      const jsonMatch = response.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          answer: parsed.answer || 'No pude procesar tu pregunta',
          data: parsed.data || context,
          type: parsed.type || 'insight',
        };
      }
    } catch (error) {
      this.logger.error('Ask query failed', error);
    }

    // Fallback response
    return {
      answer: `Tienes ${context.pendingTasks} tareas pendientes, ${context.overdueTasks} vencidas, y completaste ${context.completedToday} hoy.`,
      data: context,
      type: 'summary',
    };
  }
}
