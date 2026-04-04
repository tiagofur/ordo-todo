import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { GeminiAIService } from '../ai/gemini-ai.service';
import { PrismaService } from '../database/prisma.service';

/**
 * Extracted action item from a meeting
 */
export interface ActionItem {
  title: string;
  description?: string;
  assignee?: string;
  dueDate?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  context: string; // The part of the transcript that generated this
}

/**
 * Key decision made in a meeting
 */
export interface KeyDecision {
  decision: string;
  context: string;
  participants?: string[];
}

/**
 * Meeting participant mentioned in transcript
 */
export interface MeetingParticipant {
  name: string;
  role?: string;
  speakingTime?: number; // percentage
}

/**
 * Topics discussed in the meeting
 */
export interface MeetingTopic {
  topic: string;
  duration?: number; // minutes
  summary: string;
}

/**
 * Full meeting analysis result
 */
export interface MeetingAnalysis {
  summary: string;
  keyPoints: string[];
  actionItems: ActionItem[];
  decisions: KeyDecision[];
  participants: MeetingParticipant[];
  topics: MeetingTopic[];
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'MIXED';
  followUpRequired: boolean;
  suggestedFollowUpDate?: string;
}

/**
 * Meeting record stored in database
 */
export interface MeetingRecord {
  id: string;
  userId: string;
  title: string;
  date: Date;
  duration: number; // minutes
  transcript?: string;
  audioUrl?: string;
  analysis?: MeetingAnalysis;
  projectId?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class MeetingAssistantService {
  private readonly logger = new Logger(MeetingAssistantService.name);

  constructor(
    private readonly geminiAI: GeminiAIService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Analyze a meeting transcript and extract insights
   */
  async analyzeTranscript(
    transcript: string,
    options: {
      meetingTitle?: string;
      participants?: string[];
      duration?: number;
      projectContext?: string;
    } = {},
  ): Promise<MeetingAnalysis> {
    this.logger.log('Analyzing meeting transcript...');

    const systemPrompt = `Eres un asistente de reuniones experto. Tu trabajo es analizar transcripciones de reuniones y extraer información útil.

CONTEXTO DE LA REUNIÓN:
${options.meetingTitle ? `- Título: ${options.meetingTitle}` : ''}
${options.participants?.length ? `- Participantes: ${options.participants.join(', ')}` : ''}
${options.duration ? `- Duración: ${options.duration} minutos` : ''}
${options.projectContext ? `- Contexto del proyecto: ${options.projectContext}` : ''}

INSTRUCCIONES:
1. Lee cuidadosamente la transcripción
2. Identifica los puntos clave discutidos
3. Extrae TODAS las tareas y acciones mencionadas
4. Identifica decisiones importantes tomadas
5. Determina el sentimiento general de la reunión
6. Sugiere si se necesita seguimiento

REGLAS PARA ACTION ITEMS:
- Busca frases como "hay que", "necesitamos", "deberíamos", "vamos a", "te encargas de"
- Cada acción debe tener un título claro y conciso
- Intenta identificar quién es responsable si se menciona
- Estima la prioridad basándote en el contexto
- Incluye el contexto original para referencia

Responde ÚNICAMENTE con JSON válido en este formato:
{
  "summary": "Resumen ejecutivo de 2-3 oraciones",
  "keyPoints": ["punto 1", "punto 2", ...],
  "actionItems": [
    {
      "title": "Título de la tarea",
      "description": "Descripción opcional",
      "assignee": "Nombre o null",
      "dueDate": "YYYY-MM-DD o null",
      "priority": "LOW|MEDIUM|HIGH|URGENT",
      "context": "Parte relevante del transcript"
    }
  ],
  "decisions": [
    {
      "decision": "Descripción de la decisión",
      "context": "Contexto de la decisión",
      "participants": ["participante1", "participante2"]
    }
  ],
  "participants": [
    {
      "name": "Nombre",
      "role": "Rol si se menciona"
    }
  ],
  "topics": [
    {
      "topic": "Tema discutido",
      "summary": "Breve resumen del tema"
    }
  ],
  "sentiment": "POSITIVE|NEUTRAL|NEGATIVE|MIXED",
  "followUpRequired": true|false,
  "suggestedFollowUpDate": "YYYY-MM-DD o null"
}`;

    const userPrompt = `Analiza esta transcripción de reunión:\n\n${transcript}`;

    try {
      const response = await this.geminiAI.generate(systemPrompt, userPrompt);

      // Parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new BadRequestException('No valid JSON found in AI response');
      }

      const analysis = JSON.parse(jsonMatch[0]) as MeetingAnalysis;

      // Validate and set defaults
      return {
        summary: analysis.summary || 'No se pudo generar un resumen',
        keyPoints: analysis.keyPoints || [],
        actionItems: (analysis.actionItems || []).map((item) => ({
          ...item,
          priority: item.priority || 'MEDIUM',
          context: item.context || '',
        })),
        decisions: analysis.decisions || [],
        participants: analysis.participants || [],
        topics: analysis.topics || [],
        sentiment: analysis.sentiment || 'NEUTRAL',
        followUpRequired: analysis.followUpRequired ?? false,
        suggestedFollowUpDate: analysis.suggestedFollowUpDate,
      };
    } catch (error) {
      this.logger.error('Failed to analyze transcript', error);
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Failed to analyze meeting transcript');
    }
  }

  /**
   * Extract only action items from a transcript (lighter analysis)
   */
  async extractActionItems(
    transcript: string,
    projectContext?: string,
  ): Promise<ActionItem[]> {
    this.logger.log('Extracting action items from transcript...');

    const systemPrompt = `Eres un asistente que extrae tareas y acciones de transcripciones de reuniones.

${projectContext ? `Contexto del proyecto: ${projectContext}` : ''}

INSTRUCCIONES:
- Identifica TODAS las tareas, acciones, y compromisos mencionados
- Busca frases como: "hay que", "necesitamos", "deberíamos", "vamos a", "te encargas de", "pendiente", "tarea"
- Para cada acción, extrae: título, responsable (si se menciona), y prioridad
- La prioridad debe inferirse del contexto (urgente, importante, normal)

Responde ÚNICAMENTE con un array JSON:
[
  {
    "title": "Título conciso de la tarea",
    "description": "Descripción adicional si aplica",
    "assignee": "Nombre del responsable o null",
    "priority": "LOW|MEDIUM|HIGH|URGENT",
    "context": "Frase original del transcript"
  }
]`;

    try {
      const response = await this.geminiAI.generate(
        systemPrompt,
        `Transcript:\n${transcript}`,
      );

      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        return [];
      }

      const items = JSON.parse(jsonMatch[0]) as ActionItem[];
      return items.map((item) => ({
        ...item,
        priority: item.priority || 'MEDIUM',
        context: item.context || '',
      }));
    } catch (error) {
      this.logger.error('Failed to extract action items', error);
      return [];
    }
  }

  /**
   * Generate a meeting summary from transcript
   */
  async generateSummary(
    transcript: string,
    style: 'executive' | 'detailed' | 'bullet-points' = 'executive',
  ): Promise<string> {
    this.logger.log(`Generating ${style} summary...`);

    const styleInstructions = {
      executive:
        'Genera un resumen ejecutivo de 2-3 párrafos cortos. Enfócate en las decisiones clave y próximos pasos.',
      detailed:
        'Genera un resumen detallado que cubra todos los temas discutidos, decisiones tomadas, y acciones acordadas.',
      'bullet-points':
        'Genera un resumen en formato de puntos (bullets). Cada punto debe ser conciso y actionable.',
    };

    const systemPrompt = `Eres un asistente de reuniones. ${styleInstructions[style]}
    
El resumen debe estar en español y ser profesional pero accesible.`;

    try {
      const response = await this.geminiAI.generate(
        systemPrompt,
        `Transcript:\n\n${transcript}`,
      );
      return response;
    } catch (error) {
      this.logger.error('Failed to generate summary', error);
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Failed to generate meeting summary');
    }
  }

  /**
   * Convert action items to tasks in the system
   */
  async convertToTasks(
    userId: string,
    actionItems: ActionItem[],
    options: {
      projectId?: string;
      autoAssign?: boolean;
    } = {},
  ): Promise<{ created: number; tasks: Array<{ id: string; title: string }> }> {
    this.logger.log(
      `Converting ${actionItems.length} action items to tasks...`,
    );

    const createdTasks: Array<{ id: string; title: string }> = [];

    for (const item of actionItems) {
      try {
        // Build task data dynamically to handle optional fields
        const taskData: any = {
          title: item.title,
          description: item.description
            ? `${item.description}\n\n---\n📝 Contexto de la reunión: "${item.context}"`
            : `📝 Contexto de la reunión: "${item.context}"`,
          priority: item.priority,
          status: 'TODO',
          ownerId: userId,
          metadata: {
            source: 'meeting',
            originalContext: item.context,
            suggestedAssignee: item.assignee,
          },
        };

        if (item.dueDate) {
          taskData.dueDate = new Date(item.dueDate);
        }

        if (options.projectId) {
          taskData.projectId = options.projectId;
        }

        const task = await this.prisma.task.create({
          data: taskData,
        });
        createdTasks.push({ id: task.id, title: task.title });
      } catch (error) {
        this.logger.error(
          `Failed to create task for action item: ${item.title}`,
          error,
        );
      }
    }

    return {
      created: createdTasks.length,
      tasks: createdTasks,
    };
  }

  /**
   * Save a meeting record (for future reference)
   */
  async saveMeeting(
    userId: string,
    data: {
      title: string;
      date: Date;
      duration: number;
      transcript?: string;
      audioUrl?: string;
      analysis?: MeetingAnalysis;
      projectId?: string;
    },
  ): Promise<any> {
    // Note: This would require a Meeting model in Prisma schema
    // For now, we'll store it in a JSON field or return the data
    this.logger.log(`Saving meeting: ${data.title}`);

    // In a full implementation, this would be:
    // return this.prisma.meeting.create({ data: { ...data, userId } });

    // For now, return the data as-is with a generated ID
    return {
      id: `meeting_${Date.now()}`,
      userId,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Suggest improvements for future meetings based on analysis
   */
  async getMeetingInsights(analyses: MeetingAnalysis[]): Promise<{
    patterns: string[];
    improvements: string[];
    actionItemTrends: string;
  }> {
    if (analyses.length === 0) {
      return {
        patterns: [],
        improvements: [],
        actionItemTrends: 'No hay suficientes datos',
      };
    }

    const totalActionItems = analyses.reduce(
      (sum, a) => sum + a.actionItems.length,
      0,
    );
    const avgActionItems = Math.round(totalActionItems / analyses.length);

    const patterns: string[] = [];
    const improvements: string[] = [];

    // Analyze patterns
    const sentiments = analyses.map((a) => a.sentiment);
    const negativeCount = sentiments.filter((s) => s === 'NEGATIVE').length;
    if (negativeCount > analyses.length * 0.3) {
      patterns.push('Tendencia hacia reuniones con sentimiento negativo');
      improvements.push('Considerar incluir más tiempo para discusión abierta');
    }

    const followUpCount = analyses.filter((a) => a.followUpRequired).length;
    if (followUpCount > analyses.length * 0.7) {
      patterns.push('La mayoría de reuniones requieren seguimiento');
      improvements.push(
        'Reservar tiempo al final para confirmar próximos pasos',
      );
    }

    if (avgActionItems > 10) {
      patterns.push('Alto número de action items por reunión');
      improvements.push('Considerar reuniones más enfocadas con menos temas');
    }

    return {
      patterns,
      improvements,
      actionItemTrends: `Promedio de ${avgActionItems} action items por reunión`,
    };
  }
}
