import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { GeminiAIService } from '../ai/gemini-ai.service';
import { ChatRole } from '@prisma/client';

export interface UserContext {
    pendingTasks: Array<{
        id: string;
        title: string;
        priority: string;
        dueDate: Date | null;
        estimatedMinutes: number | null;
    }>;
    todayCompleted: number;
    activeTimer: {
        isActive: boolean;
        taskTitle?: string;
        startedAt?: Date;
        type?: string;
    } | null;
    timerStats: {
        todayMinutes: number;
        weeklyHours: number;
        avgSessionLength: number;
    };
    profile: {
        completionRate: number;
        peakHours: number[];
        avgTasksPerDay: number;
        currentStreak: number;
    };
    timestamp: string;
}

export interface CoachResponse {
    message: string;
    actions: Array<{
        type: string;
        data?: any;
        result?: any;
    }>;
    suggestions: string[];
    context?: Partial<UserContext>;
}

@Injectable()
export class ProductivityCoachService {
    private readonly logger = new Logger(ProductivityCoachService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly geminiAI: GeminiAIService,
    ) { }

    /**
     * Build comprehensive context for AI prompt
     */
    async buildContext(userId: string): Promise<UserContext> {
        const [pendingTasks, todayCompleted, activeTimer, timerStats, profile] =
            await Promise.all([
                this.getPendingTasks(userId),
                this.getTodayCompletedCount(userId),
                this.getActiveTimer(userId),
                this.getTimerStats(userId),
                this.getProductivityProfile(userId),
            ]);

        return {
            pendingTasks,
            todayCompleted,
            activeTimer,
            timerStats,
            profile,
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Chat with productivity coach with full context awareness
     */
    async chat(
        userId: string,
        message: string,
        conversationHistory: Array<{ role: ChatRole; content: string }>,
    ): Promise<CoachResponse> {
        const context = await this.buildContext(userId);
        const systemPrompt = this.buildSystemPrompt(context);

        // Convert history to format expected by GeminiAI
        const history = conversationHistory.map((msg) => ({
            role: msg.role === ChatRole.USER ? 'user' : 'assistant',
            content: msg.content,
        }));

        const startTime = Date.now();

        try {
            const response = await this.geminiAI.chat(message, history as any, {
                tasks: context.pendingTasks,
            });

            const processingTime = Date.now() - startTime;
            this.logger.debug(`Coach response generated in ${processingTime}ms`);

            return {
                message: response.message,
                actions: response.actions || [],
                suggestions: response.suggestions || [],
                context: {
                    activeTimer: context.activeTimer,
                    todayCompleted: context.todayCompleted,
                },
            };
        } catch (error) {
            this.logger.error('Coach chat failed', error);
            return {
                message:
                    'Lo siento, hubo un problema procesando tu mensaje. ¿Puedes intentar de nuevo?',
                actions: [],
                suggestions: ['Intenta reformular tu pregunta'],
            };
        }
    }

    /**
     * Generate proactive insights based on user's current state
     */
    async getProactiveInsights(userId: string): Promise<
        Array<{
            type: string;
            message: string;
            priority: 'LOW' | 'MEDIUM' | 'HIGH';
            actionable: boolean;
            action?: { type: string; data: any };
        }>
    > {
        const context = await this.buildContext(userId);
        const insights: Array<{
            type: string;
            message: string;
            priority: 'LOW' | 'MEDIUM' | 'HIGH';
            actionable: boolean;
            action?: { type: string; data: any };
        }> = [];

        // Check for overdue tasks
        const overdueTasks = context.pendingTasks.filter(
            (t) => t.dueDate && new Date(t.dueDate) < new Date(),
        );
        if (overdueTasks.length > 0) {
            insights.push({
                type: 'OVERDUE_ALERT',
                message: `Tienes ${overdueTasks.length} tarea${overdueTasks.length > 1 ? 's' : ''} vencida${overdueTasks.length > 1 ? 's' : ''}. ¿Necesitas ayuda para priorizarlas?`,
                priority: 'HIGH',
                actionable: true,
                action: { type: 'SHOW_OVERDUE', data: { taskIds: overdueTasks.map((t) => t.id) } },
            });
        }

        // Check peak hours
        const currentHour = new Date().getHours();
        if (context.profile.peakHours.includes(currentHour)) {
            const urgentTask = context.pendingTasks.find((t) => t.priority === 'URGENT' || t.priority === 'HIGH');
            if (urgentTask && !context.activeTimer?.isActive) {
                insights.push({
                    type: 'PEAK_HOUR_TIP',
                    message: `Son las ${currentHour}:00, tu hora más productiva. ¿Quieres empezar "${urgentTask.title}"?`,
                    priority: 'MEDIUM',
                    actionable: true,
                    action: { type: 'START_TASK', data: { taskId: urgentTask.id } },
                });
            }
        }

        // Check for long work session
        if (context.activeTimer?.isActive && context.activeTimer.startedAt) {
            const sessionMinutes = Math.floor(
                (Date.now() - new Date(context.activeTimer.startedAt).getTime()) / 60000,
            );
            if (sessionMinutes > 90) {
                insights.push({
                    type: 'BREAK_REMINDER',
                    message: `Llevas ${sessionMinutes} minutos trabajando. Un descanso corto puede mejorar tu enfoque.`,
                    priority: 'MEDIUM',
                    actionable: true,
                    action: { type: 'SUGGEST_BREAK', data: {} },
                });
            }
        }

        // Celebrate completions
        if (context.todayCompleted >= 5 && context.todayCompleted % 5 === 0) {
            insights.push({
                type: 'CELEBRATION',
                message: `¡Excelente! Has completado ${context.todayCompleted} tareas hoy. ¡Sigue así! 🎉`,
                priority: 'LOW',
                actionable: false,
            });
        }

        // Check streak
        if (context.profile.currentStreak >= 7 && context.profile.currentStreak % 7 === 0) {
            insights.push({
                type: 'STREAK_MILESTONE',
                message: `¡Racha de ${context.profile.currentStreak} días! Tu consistencia está pagando dividendos.`,
                priority: 'LOW',
                actionable: false,
            });
        }

        return insights;
    }

    // ============ PRIVATE HELPER METHODS ============

    private buildSystemPrompt(context: UserContext): string {
        return `Eres un coach de productividad personal para Ordo-Todo. Tu nombre es Coach.

CONTEXTO ACTUAL DEL USUARIO:
- Tareas pendientes: ${context.pendingTasks.length}
- Completadas hoy: ${context.todayCompleted}
- Timer activo: ${context.activeTimer?.isActive ? `Sí, trabajando en "${context.activeTimer.taskTitle}"` : 'No'}
- Minutos trabajados hoy: ${context.timerStats.todayMinutes}
- Horas esta semana: ${context.timerStats.weeklyHours.toFixed(1)}
- Tasa de completado: ${Math.round(context.profile.completionRate * 100)}%
- Racha actual: ${context.profile.currentStreak} días

TAREAS PENDIENTES PRIORITARIAS:
${context.pendingTasks
                .slice(0, 5)
                .map((t) => `- [${t.priority}] "${t.title}"${t.dueDate ? ` (vence: ${new Date(t.dueDate).toLocaleDateString()})` : ''}`)
                .join('\n')}

TUS CAPACIDADES:
1. Responder preguntas sobre productividad
2. Dar consejos personalizados basados en los datos
3. Ayudar a priorizar tareas
4. Sugerir cuándo tomar descansos
5. Celebrar logros y mantener motivación
6. Crear tareas si el usuario lo pide (usando JSON action)

FORMATO DE RESPUESTA:
Responde siempre en JSON:
{
  "message": "Tu respuesta amigable y concisa",
  "actions": [{ "type": "CREATE_TASK", "data": {...} }], // o [] si no hay acciones
  "suggestions": ["Sugerencia de seguimiento 1", "Sugerencia 2"]
}

REGLAS:
- Sé conciso pero amigable
- Personaliza usando los datos del contexto
- Responde en español
- No inventes datos que no tengas`;
    }

    private async getPendingTasks(userId: string) {
        const tasks = await this.prisma.task.findMany({
            where: {
                OR: [{ creatorId: userId }, { assigneeId: userId }],
                status: { notIn: ['COMPLETED', 'CANCELLED'] },
            },
            orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
            take: 10,
            select: {
                id: true,
                title: true,
                priority: true,
                dueDate: true,
                estimatedMinutes: true,
            },
        });

        return tasks.map((t) => ({
            id: t.id,
            title: t.title,
            priority: t.priority,
            dueDate: t.dueDate,
            estimatedMinutes: t.estimatedMinutes,
        }));
    }

    private async getTodayCompletedCount(userId: string): Promise<number> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return this.prisma.task.count({
            where: {
                OR: [{ creatorId: userId }, { assigneeId: userId }],
                status: 'COMPLETED',
                completedAt: { gte: today },
            },
        });
    }

    private async getActiveTimer(userId: string) {
        const session = await this.prisma.timeSession.findFirst({
            where: {
                userId,
                endedAt: null,
            },
            include: {
                task: {
                    select: { title: true },
                },
            },
            orderBy: { startedAt: 'desc' },
        });

        if (!session) {
            return null;
        }

        return {
            isActive: true,
            taskTitle: session.task?.title,
            startedAt: session.startedAt,
            type: session.type,
        };
    }

    private async getTimerStats(userId: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());

        const [todaySessions, weeklySessions] = await Promise.all([
            this.prisma.timeSession.findMany({
                where: {
                    userId,
                    startedAt: { gte: today },
                    duration: { not: null },
                },
                select: { duration: true },
            }),
            this.prisma.timeSession.findMany({
                where: {
                    userId,
                    startedAt: { gte: weekStart },
                    duration: { not: null },
                },
                select: { duration: true },
            }),
        ]);

        const todayMinutes = todaySessions.reduce((sum, s) => sum + (s.duration || 0), 0);
        const weeklyMinutes = weeklySessions.reduce((sum, s) => sum + (s.duration || 0), 0);
        const avgSessionLength =
            weeklySessions.length > 0
                ? weeklyMinutes / weeklySessions.length
                : 25; // Default to pomodoro length

        return {
            todayMinutes,
            weeklyHours: weeklyMinutes / 60,
            avgSessionLength: Math.round(avgSessionLength),
        };
    }

    private async getProductivityProfile(userId: string) {
        // Get task completion rate (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [totalTasks, completedTasks, streak, hourlyActivity] = await Promise.all([
            this.prisma.task.count({
                where: {
                    OR: [{ creatorId: userId }, { assigneeId: userId }],
                    createdAt: { gte: thirtyDaysAgo },
                },
            }),
            this.prisma.task.count({
                where: {
                    OR: [{ creatorId: userId }, { assigneeId: userId }],
                    status: 'COMPLETED',
                    completedAt: { gte: thirtyDaysAgo },
                },
            }),
            this.calculateStreak(userId),
            this.getHourlyActivity(userId),
        ]);

        const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;
        const avgTasksPerDay = completedTasks / 30;

        // Find peak hours (top 3 hours with most activity)
        const peakHours = hourlyActivity
            .sort((a, b) => b.count - a.count)
            .slice(0, 3)
            .map((h) => h.hour);

        return {
            completionRate,
            peakHours,
            avgTasksPerDay,
            currentStreak: streak,
        };
    }

    private async calculateStreak(userId: string): Promise<number> {
        // Simple streak calculation - count consecutive days with completed tasks
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let streak = 0;
        let checkDate = new Date(today);

        for (let i = 0; i < 365; i++) {
            const dayStart = new Date(checkDate);
            const dayEnd = new Date(checkDate);
            dayEnd.setDate(dayEnd.getDate() + 1);

            const count = await this.prisma.task.count({
                where: {
                    OR: [{ creatorId: userId }, { assigneeId: userId }],
                    status: 'COMPLETED',
                    completedAt: {
                        gte: dayStart,
                        lt: dayEnd,
                    },
                },
            });

            if (count > 0) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        return streak;
    }

    private async getHourlyActivity(userId: string): Promise<Array<{ hour: number; count: number }>> {
        // Get completed tasks by hour of day (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const sessions = await this.prisma.timeSession.findMany({
            where: {
                userId,
                startedAt: { gte: thirtyDaysAgo },
                duration: { not: null },
            },
            select: {
                startedAt: true,
            },
        });

        // Count by hour
        const hourCounts = new Map<number, number>();
        for (const session of sessions) {
            const hour = new Date(session.startedAt).getHours();
            hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
        }

        return Array.from(hourCounts.entries()).map(([hour, count]) => ({
            hour,
            count,
        }));
    }
}
