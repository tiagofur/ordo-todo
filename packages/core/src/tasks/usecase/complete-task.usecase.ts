import { UseCase } from "../../shared/use-case";
import { Task } from "../model/task.entity";
import { TaskRepository } from "../provider/task.repository";

export interface CompleteTaskInput {
    taskId: string;
    userId?: string;
    ownerId?: string;
}

export class CompleteTaskUseCase implements UseCase<CompleteTaskInput, Task> {
    constructor(private readonly repository: TaskRepository) { }

    async execute(input: CompleteTaskInput): Promise<Task> {
        const task = await this.repository.findById(input.taskId);

        if (!task) {
            throw new Error("Task not found");
        }

        const actingUserId = input.userId ?? input.ownerId;
        const isOwner = task.props.ownerId === actingUserId;
        const isAssignee = task.props.assigneeId === actingUserId;

        if (actingUserId && !isOwner && !isAssignee) {
            throw new Error("Unauthorized");
        }

        const completedTask = task.complete();
        await this.repository.update(completedTask);

        return completedTask;
    }
}
