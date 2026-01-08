import {
  PrismaClient,
  Task as PrismaTask,
  TaskStatus as PrismaTaskStatus,
  Priority as PrismaPriority,
} from "@prisma/client";
import {
  Task,
  TaskRepository,
  TaskStatus,
  TaskPriority,
} from "@ordo-todo/core";

export class PrismaTaskRepository implements TaskRepository {
  constructor(private readonly prisma: PrismaClient) { }

  private toDomain(prismaTask: PrismaTask & { subTasks?: PrismaTask[] }): Task {
    return new Task({
      id: prismaTask.id,
      title: prismaTask.title,
      description: prismaTask.description ?? undefined,
      status: this.mapStatusToDomain(prismaTask.status),
      priority: this.mapPriorityToDomain(prismaTask.priority),
      dueDate: prismaTask.dueDate ?? undefined,
      projectId: prismaTask.projectId,
      ownerId: prismaTask.ownerId,
      parentTaskId: prismaTask.parentTaskId ?? undefined,
      subTasks: prismaTask.subTasks?.map((st) => this.toDomain(st)),
      estimatedMinutes: prismaTask.estimatedMinutes ?? undefined,
      isDeleted: prismaTask.isDeleted,
      deletedAt: prismaTask.deletedAt ?? undefined,
      createdAt: prismaTask.createdAt,
      updatedAt: prismaTask.updatedAt,
    });
  }

  private mapStatusToDomain(status: PrismaTaskStatus): TaskStatus {
    switch (status) {
      case "TODO":
        return "TODO";
      case "IN_PROGRESS":
        return "IN_PROGRESS";
      case "COMPLETED":
        return "COMPLETED";
      case "CANCELLED":
        return "CANCELLED";
      default:
        return "TODO";
    }
  }

  private mapPriorityToDomain(priority: PrismaPriority): TaskPriority {
    switch (priority) {
      case "LOW":
        return "LOW";
      case "MEDIUM":
        return "MEDIUM";
      case "HIGH":
        return "HIGH";
      case "URGENT":
        return "URGENT";
      default:
        return "MEDIUM";
    }
  }

  private mapStatusToPrisma(status: TaskStatus): PrismaTaskStatus {
    switch (status) {
      case "TODO":
        return "TODO";
      case "IN_PROGRESS":
        return "IN_PROGRESS";
      case "COMPLETED":
        return "COMPLETED";
      case "CANCELLED":
        return "CANCELLED";
      default:
        return "TODO";
    }
  }

  private mapPriorityToPrisma(priority: TaskPriority): PrismaPriority {
    switch (priority) {
      case "LOW":
        return "LOW";
      case "MEDIUM":
        return "MEDIUM";
      case "HIGH":
        return "HIGH";
      case "URGENT":
        return "URGENT";
      default:
        return "MEDIUM";
    }
  }

  async save(task: Task): Promise<void> {
    const data = {
      id: task.id as string,
      title: task.props.title,
      description: task.props.description,
      status: this.mapStatusToPrisma(task.props.status),
      priority: this.mapPriorityToPrisma(task.props.priority),
      dueDate: task.props.dueDate,
      estimatedMinutes: task.props.estimatedMinutes,
      projectId: task.props.projectId,
      ownerId: task.props.ownerId,
      parentTaskId: task.props.parentTaskId ?? null,
      isDeleted: task.props.isDeleted ?? false,
      deletedAt: task.props.deletedAt ?? null,
    };

    await this.prisma.task.upsert({
      where: { id: task.id as string },
      create: data,
      update: data,
    });
  }

  async findById(id: string): Promise<Task | null> {
    const task = await this.prisma.task.findFirst({
      where: { id, isDeleted: false },
      include: { subTasks: true },
    });
    if (!task) return null;
    return this.toDomain(task);
  }

  async findByOwnerId(ownerId: string): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      where: {
        ownerId,
        isDeleted: false,
      },
    });
    return tasks.map((t) => this.toDomain(t));
  }

  async findByWorkspaceMemberships(
    userId: string,
    filters?: { projectId?: string; tags?: string[] }
  ): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { assigneeId: userId },
        ],
        isDeleted: false,
        ...(filters?.projectId && { projectId: filters.projectId }),
      },
    });
    return tasks.map((t) => this.toDomain(t));
  }

  async update(task: Task): Promise<void> {
    await this.save(task);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.task.delete({ where: { id } });
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.task.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async restore(id: string): Promise<void> {
    await this.prisma.task.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
        updatedAt: new Date(),
      },
    });
  }

  async permanentDelete(id: string): Promise<void> {
    await this.prisma.task.delete({ where: { id } });
  }

  async findDeleted(projectId: string): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      where: {
        projectId,
        isDeleted: true,
      },
      include: { subTasks: true },
    });
    return tasks.map((t) => this.toDomain(t));
  }

  async findTodayTasks(
    userId: string,
    today: Date,
    tomorrow: Date,
  ): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      where: {
        ownerId: userId,
        status: { not: "COMPLETED" },
        parentTaskId: null,
        isDeleted: false,
      },
      orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
    });
    return tasks.map((t) => this.toDomain(t));
  }

  async findScheduledTasks(
    userId: string,
    startOfDay: Date,
    endOfDay: Date,
  ): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      where: {
        ownerId: userId,
        scheduledDate: { gte: startOfDay, lte: endOfDay },
        isDeleted: false,
      },
      orderBy: [{ scheduledTime: "asc" }, { priority: "desc" }],
    });
    return tasks.map((t) => this.toDomain(t));
  }

  async findAvailableTasks(
    userId: string,
    today: Date,
    projectId?: string,
  ): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      where: {
        ownerId: userId,
        status: { not: "COMPLETED" },
        parentTaskId: null,
        isTimeBlocked: { not: true },
        isDeleted: false,
        OR: [{ startDate: null }, { startDate: { lte: today } }],
        ...(projectId ? { projectId } : {}),
      },
      orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
    });
    return tasks.map((t) => this.toDomain(t));
  }

  async findTimeBlockedTasks(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      where: {
        ownerId: userId,
        isTimeBlocked: true,
        scheduledDate: { gte: startDate, lte: endDate },
        scheduledTime: { not: null },
        isDeleted: false,
      },
      orderBy: [{ scheduledDate: "asc" }, { scheduledTime: "asc" }],
    });
    return tasks.map((t) => this.toDomain(t));
  }

  async groupByStatus(
    userId: string,
  ): Promise<Array<{ status: string; count: number }>> {
    const grouped = await this.prisma.task.groupBy({
      by: ["status"],
      where: { assigneeId: userId },
      _count: { id: true },
    });
    return grouped.map((t) => ({ status: t.status, count: t._count.id }));
  }
}
