import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

export interface ProductivityReportData {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  patterns: string[];
  productivityScore: number; // 0-100
}

@Injectable()
export class GeminiAIService {
  private readonly logger = new Logger(GeminiAIService.name);
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY not configured. AI features will be limited.');
      return;
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  }

  /**
   * Generate a productivity report based on metrics and sessions
   */
  async generateProductivityReport(context: {
    userId: string;
    scope: 'TASK_COMPLETION' | 'WEEKLY_SCHEDULED' | 'MONTHLY_SCHEDULED';
    metricsSnapshot: any;
    sessions?: any[];
    profile?: any;
  }): Promise<ProductivityReportData> {
    if (!this.model) {
      return this.getMockReport(context.scope);
    }

    try {
      const prompt = this.buildProductivityReportPrompt(context);
      const result = await this.model.generateContent(prompt);
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
          productivityScore: Math.min(100, Math.max(0, data.productivityScore || 50)),
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
    const { scope, metricsSnapshot, sessions, profile } = context;

    let prompt = `You are an AI productivity coach analyzing user work patterns. Generate a productivity report in JSON format.

Context:
- Report Scope: ${scope}
- Period: ${this.getScopePeriod(scope)}
- Metrics: ${JSON.stringify(metricsSnapshot, null, 2)}
`;

    if (sessions && sessions.length > 0) {
      prompt += `\nRecent Work Sessions (${sessions.length} total):
${sessions.slice(0, 10).map((s: any, i: number) => `  ${i + 1}. Duration: ${s.duration}min, Pauses: ${s.pauseCount || 0}, Completed: ${s.wasCompleted ? 'Yes' : 'No'}`).join('\n')}
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
      default:
        return 'Unknown';
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
      weaknesses: [
        'Se detectaron algunas interrupciones en tus sesiones',
      ],
      recommendations: [
        'Intenta reducir las pausas durante las sesiones de trabajo',
        'Programa tus tareas más importantes durante tus horas pico',
      ],
      patterns: [
        'Trabajas mejor en bloques de 25-30 minutos',
      ],
      productivityScore: 70,
    };
  }
}
