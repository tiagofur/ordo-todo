import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import {
    ICollaborationRepository,
    MemberWorkload,
    TeamWorkloadSummary,
    WorkloadSuggestion,
} from "@ordo-todo/core";

@Injectable()
export class PrismaCollaborationRepository implements ICollaborationRepository {
    private readonly logger = new Logger(PrismaCollaborationRepository.name);

    // Configurable thresholds
    private readonly WORKLOAD_THRESHOLDS = {
        LOW: 25,
        MODERATE: 50,
        HIGH: 75,
        OVERLOADED: 100,
    };

    private readonly DAILY_CAPACITY_HOURS = 8;
    private readonly WEEKLY_CAPACITY_HOURS = 40;

    constructor(private readonly prisma: PrismaService) { }

    async getWorkspaceWorkload(workspaceId: string): Promise<TeamWorkloadSummary> {
        // Get workspace info
        const workspace = await this.prisma.workspace.findUnique({
            where: { id: workspaceId },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                image: true,
                            },
                        },
                    },
                },
            },
        });

        if (!workspace) {
            throw new Error("Workspace not found");
        }

        // Get workload for each member
        const memberWorkloads = await Promise.all(
            workspace.members.map((member) =>
                this.getMemberWorkload(member.user.id, workspaceId)
            )
        );

        // Calculate aggregates
        const totalTasks = memberWorkloads.reduce(
            (sum, m) => sum + m.assignedTasks,
            0
        );
        const totalCompleted = memberWorkloads.reduce(
            (sum, m) => sum + m.completedTasks,
            0
        );
        const totalOverdue = memberWorkloads.reduce(
            (sum, m) => sum + m.overdueTasks,
            0
        );
        const averageWorkload =
            memberWorkloads.length > 0
                ? Math.round(
                    memberWorkloads.reduce((sum, m) => sum + m.workloadScore, 0) /
                    memberWorkloads.length
                )
                : 0;

        // Count by workload level
        const membersOverloaded = memberWorkloads.filter(
            (m) => m.workloadLevel === "OVERLOADED"
        ).length;
        const membersUnderutilized = memberWorkloads.filter(
            (m) => m.workloadLevel === "LOW"
        ).length;
        const membersBalanced = memberWorkloads.filter(
            (m) => m.workloadLevel === "MODERATE" || m.workloadLevel === "HIGH"
        ).length;

        // Generate redistribution suggestions
        const redistributionSuggestions =
            this.generateRedistributionSuggestions(memberWorkloads);

        return {
            workspaceId,
            workspaceName: workspace.name,
            totalMembers: workspace.members.length,
            totalTasks,
            totalCompleted,
            totalOverdue,
            averageWorkload,
            membersOverloaded,
            membersUnderutilized,
            membersBalanced,
            redistributionSuggestions,
            members: memberWorkloads,
        };
    }

    async getMemberWorkload(
        userId: string,
        workspaceId?: string
    ): Promise<MemberWorkload> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
            },
        });

        if (!user) {
            throw new Error("User not found");
        }

        const taskFilter: any = {
            OR: [{ ownerId: userId }, { assignee: { id: userId } }],
        };

        if (workspaceId) {
            taskFilter.project = {
                workspaceId,
            };
        }

        const [assignedTasks, completedTasks, overdueTasks, inProgressTasks] =
            await Promise.all([
                this.prisma.task.count({
                    where: {
                        ...taskFilter,
                        status: { notIn: ["COMPLETED", "CANCELLED"] },
                    },
                }),
                this.prisma.task.count({
                    where: {
                        ...taskFilter,
                        status: "COMPLETED",
                        completedAt: { gte: this.getWeekStart() },
                    },
                }),
                this.prisma.task.count({
                    where: {
                        ...taskFilter,
                        status: { notIn: ["COMPLETED", "CANCELLED"] },
                        dueDate: { lt: new Date() },
                    },
                }),
                this.prisma.task.count({
                    where: {
                        ...taskFilter,
                        status: "IN_PROGRESS",
                    },
                }),
            ]);

        const weekStart = this.getWeekStart();
        const sessions = await this.prisma.timeSession.findMany({
            where: {
                userId,
                startedAt: { gte: weekStart },
                type: "WORK",
            },
            select: {
                duration: true,
            },
        });

        const hoursWorkedThisWeek =
            sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60;
        const daysWorked = Math.max(1, this.getDaysIntoWeek());
        const avgHoursPerDay = hoursWorkedThisWeek / daysWorked;

        const workloadScore = this.calculateWorkloadScore({
            assignedTasks,
            overdueTasks,
            inProgressTasks,
            hoursWorkedThisWeek,
            avgHoursPerDay,
        });

        const workloadLevel = this.getWorkloadLevel(workloadScore);
        const capacityRemaining = Math.max(
            0,
            this.WEEKLY_CAPACITY_HOURS - hoursWorkedThisWeek
        );

        const trend = await this.calculateTrend(userId);

        const activeSession = await this.prisma.timeSession.findFirst({
            where: {
                userId,
                endedAt: null,
                type: "WORK",
            },
            include: {
                task: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
            orderBy: { startedAt: "desc" },
        });

        return {
            userId: user.id,
            userName: user.name || user.email,
            userEmail: user.email,
            avatarUrl: user.image || undefined,
            assignedTasks,
            completedTasks,
            overdueTasks,
            inProgressTasks,
            hoursWorkedThisWeek: Math.round(hoursWorkedThisWeek * 10) / 10,
            avgHoursPerDay: Math.round(avgHoursPerDay * 10) / 10,
            workloadScore,
            workloadLevel,
            capacityRemaining: Math.round(capacityRemaining * 10) / 10,
            trend,
            currentTask: activeSession?.task
                ? {
                    id: activeSession.task.id,
                    title: activeSession.task.title,
                    startedAt: activeSession.startedAt,
                }
                : undefined,
        };
    }

    async getBalancingSuggestions(
        workspaceId: string
    ): Promise<WorkloadSuggestion[]> {
        const workload = await this.getWorkspaceWorkload(workspaceId);
        const suggestions: WorkloadSuggestion[] = [];

        for (const resuggestion of workload.redistributionSuggestions) {
            suggestions.push({
                type: "REDISTRIBUTE",
                priority: "HIGH",
                description: resuggestion.reason,
                affectedUsers: [resuggestion.fromUserId, resuggestion.toUserId],
                action: {
                    type: "REASSIGN_TASKS",
                    data: {
                        fromUser: resuggestion.fromUserId,
                        toUser: resuggestion.toUserId,
                        count: resuggestion.taskCount,
                    },
                },
            });
        }

        const membersWithOverdue = workload.members.filter(
            (m) => m.overdueTasks > 3
        );
        for (const member of membersWithOverdue) {
            suggestions.push({
                type: "PRIORITIZE",
                priority: "HIGH",
                description: `${member.userName} tiene ${member.overdueTasks} tareas vencidas que necesitan atención`,
                affectedUsers: [member.userId],
                action: {
                    type: "REVIEW_OVERDUE",
                    data: { userId: member.userId },
                },
            });
        }

        const underutilized = workload.members.filter(
            (m) => m.workloadLevel === "LOW" && m.hoursWorkedThisWeek < 10
        );
        for (const member of underutilized) {
            suggestions.push({
                type: "DELEGATE",
                priority: "MEDIUM",
                description: `${member.userName} tiene capacidad disponible (${Math.round(
                    member.capacityRemaining
                )}h esta semana)`,
                affectedUsers: [member.userId],
                action: {
                    type: "SUGGEST_TASKS",
                    data: { userId: member.userId },
                },
            });
        }

        return suggestions;
    }

    private calculateWorkloadScore(metrics: {
        assignedTasks: number;
        overdueTasks: number;
        inProgressTasks: number;
        hoursWorkedThisWeek: number;
        avgHoursPerDay: number;
    }): number {
        let score = 0;
        score += Math.min(30, metrics.assignedTasks * 3);
        score += Math.min(15, metrics.overdueTasks * 5);
        score += Math.min(5, metrics.inProgressTasks * 2);
        const timeUtilization =
            (metrics.hoursWorkedThisWeek / this.WEEKLY_CAPACITY_HOURS) * 100;
        score += Math.min(40, timeUtilization * 0.4);
        if (metrics.avgHoursPerDay > this.DAILY_CAPACITY_HOURS) {
            score += 10;
        }
        return Math.min(100, Math.round(score));
    }

    private getWorkloadLevel(score: number): MemberWorkload["workloadLevel"] {
        if (score < this.WORKLOAD_THRESHOLDS.LOW) return "LOW";
        if (score < this.WORKLOAD_THRESHOLDS.MODERATE) return "MODERATE";
        if (score < this.WORKLOAD_THRESHOLDS.HIGH) return "HIGH";
        return "OVERLOADED";
    }

    private async calculateTrend(
        userId: string
    ): Promise<MemberWorkload["trend"]> {
        const weekStart = this.getWeekStart();
        const lastWeekStart = new Date(weekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);

        const [thisWeekTasks, lastWeekTasks] = await Promise.all([
            this.prisma.task.count({
                where: {
                    OR: [{ ownerId: userId }, { assignee: { id: userId } }],
                    createdAt: { gte: weekStart },
                    status: { notIn: ["COMPLETED", "CANCELLED"] },
                },
            }),
            this.prisma.task.count({
                where: {
                    OR: [{ ownerId: userId }, { assignee: { id: userId } }],
                    createdAt: { gte: lastWeekStart, lt: weekStart },
                    status: { notIn: ["COMPLETED", "CANCELLED"] },
                },
            }),
        ]);

        const diff = thisWeekTasks - lastWeekTasks;
        if (diff > 2) return "INCREASING";
        if (diff < -2) return "DECREASING";
        return "STABLE";
    }

    private generateRedistributionSuggestions(
        members: MemberWorkload[]
    ): TeamWorkloadSummary["redistributionSuggestions"] {
        const suggestions: TeamWorkloadSummary["redistributionSuggestions"] = [];
        const overloaded = members.filter((m) => m.workloadLevel === "OVERLOADED");
        const underutilized = members.filter((m) => m.workloadLevel === "LOW");

        for (const from of overloaded) {
            for (const to of underutilized) {
                if (from.assignedTasks > 5 && to.capacityRemaining > 8) {
                    const tasksToMove = Math.min(
                        Math.floor((from.assignedTasks - 5) / 2),
                        Math.floor(to.capacityRemaining / 2)
                    );
                    if (tasksToMove > 0) {
                        suggestions.push({
                            fromUserId: from.userId,
                            fromUserName: from.userName,
                            toUserId: to.userId,
                            toUserName: to.userName,
                            taskCount: tasksToMove,
                            reason: `${from.userName} está sobrecargado (${from.assignedTasks} tareas) mientras ${to.userName} tiene capacidad disponible (${Math.round(to.capacityRemaining)}h)`,
                        });
                    }
                }
            }
        }
        return suggestions.slice(0, 5);
    }

    private getWeekStart(): Date {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        const weekStart = new Date(now.setDate(diff));
        weekStart.setHours(0, 0, 0, 0);
        return weekStart;
    }

    private getDaysIntoWeek(): number {
        const now = new Date();
        const dayOfWeek = now.getDay();
        return dayOfWeek === 0 ? 7 : dayOfWeek;
    }
}
