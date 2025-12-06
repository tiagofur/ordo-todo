import { UseCase } from "../../shared/use-case";
import { Task, TaskPriority, RecurrenceProps } from "../model/task.entity";
import { TaskRepository } from "../provider/task.repository";

export interface CreateTaskInput {
    title: string;
    description?: string;
    priority?: TaskPriority;
    dueDate?: Date;
    projectId: string;
    creatorId: string;
    assigneeId?: string;
    parentTaskId?: string;
    recurrence?: RecurrenceProps;
}

export class CreateTaskUseCase implements UseCase<CreateTaskInput, Task> {
    constructor(private readonly repository: TaskRepository) { }

    async execute(input: CreateTaskInput): Promise<Task> {
        if (!input.title) {
            throw new Error("Title is required");
        }

        const task = Task.create({
            title: input.title,
            description: input.description,
            priority: input.priority ?? "MEDIUM",
            dueDate: input.dueDate,
            projectId: input.projectId,
            creatorId: input.creatorId,
            assigneeId: input.assigneeId,
            parentTaskId: input.parentTaskId,
            recurrence: input.recurrence,
        });

        await this.repository.save(task);

        return task;
    }
}
