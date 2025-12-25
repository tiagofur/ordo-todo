import { PrismaClient, Task as PrismaTask, TaskStatus as PrismaTaskStatus, Priority as PrismaPriority } from "@prisma/client";
import { Task, TaskRepository, TaskStatus, TaskPriority } from "@ordo-todo/core";

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
            subTasks: prismaTask.subTasks?.map(st => this.toDomain(st)),
            estimatedTime: prismaTask.estimatedMinutes ?? undefined,
            createdAt: prismaTask.createdAt,
            updatedAt: prismaTask.updatedAt,
        });
    }

    private mapStatusToDomain(status: PrismaTaskStatus): TaskStatus {
        switch (status) {
            case "TODO": return "TODO";
            case "IN_PROGRESS": return "IN_PROGRESS";
            case "COMPLETED": return "COMPLETED";
            case "CANCELLED": return "CANCELLED";
            default: return "TODO";
        }
    }

    private mapPriorityToDomain(priority: PrismaPriority): TaskPriority {
        switch (priority) {
            case "LOW": return "LOW";
            case "MEDIUM": return "MEDIUM";
            case "HIGH": return "HIGH";
            case "URGENT": return "URGENT";
            default: return "MEDIUM";
        }
    }

    private mapStatusToPrisma(status: TaskStatus): PrismaTaskStatus {
        switch (status) {
            case "TODO": return "TODO";
            case "IN_PROGRESS": return "IN_PROGRESS";
            case "COMPLETED": return "COMPLETED";
            case "CANCELLED": return "CANCELLED";
            default: return "TODO";
        }
    }

    private mapPriorityToPrisma(priority: TaskPriority): PrismaPriority {
        switch (priority) {
            case "LOW": return "LOW";
            case "MEDIUM": return "MEDIUM";
            case "HIGH": return "HIGH";
            case "URGENT": return "URGENT";
            default: return "MEDIUM";
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
            estimatedMinutes: task.props.estimatedTime,
            projectId: task.props.projectId,
            ownerId: task.props.ownerId,
            parentTaskId: task.props.parentTaskId ?? null,
        };

        // Schema check: projectId is String (required) in relation?
        // model Task { ... project Project @relation(...) projectId String ... }
        // So projectId is required. But Task entity has optional projectId.
        // This is a mismatch. I should check if I made projectId optional in schema.
        // In my schema update: `projectId String`. It is required.
        // But in `TECHNICAL_DESIGN.md`: `projectId String`.
        // But in `Task` entity: `projectId?: string`.
        // If a task is not in a project (e.g. Inbox), how is it handled?
        // Maybe `projectId` should be optional in schema?
        // Let's check `TECHNICAL_DESIGN.md` again.
        // `projectId String`.
        // Maybe there is a default "Inbox" project? Or maybe it should be optional.
        // I'll assume for now it's required and I might need to fix the entity or schema later.
        // Actually, I'll make it optional in schema if I can.
        // But I already pushed the schema.
        // Let's look at `TECHNICAL_DESIGN.md` again.
        // `projectId String`.
        // `project Project @relation(...)`.
        // If it's required, then every task MUST belong to a project.
        // I'll stick to the schema for now.

        await this.prisma.task.upsert({
            where: { id: task.id as string },
            create: data,
            update: data,
        });
    }

    async findById(id: string): Promise<Task | null> {
        const task = await this.prisma.task.findUnique({
            where: { id },
            include: { subTasks: true }
        });
        if (!task) return null;
        return this.toDomain(task);
    }

    async findByOwnerId(ownerId: string): Promise<Task[]> {
        const tasks = await this.prisma.task.findMany({ where: { ownerId } });
        return tasks.map(t => this.toDomain(t));
    }

    async update(task: Task): Promise<void> {
        await this.save(task);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.task.delete({ where: { id } });
    }
}
