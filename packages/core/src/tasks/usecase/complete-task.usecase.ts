import { UseCase } from "../../shared/use-case";
import { Task } from "../model/task.entity";
import { TaskRepository } from "../provider/task.repository";

export interface CompleteTaskInput {
    taskId: string;
    creatorId: string;
}

export class CompleteTaskUseCase implements UseCase<CompleteTaskInput, Task> {
    constructor(private readonly repository: TaskRepository) { }

    async execute(input: CompleteTaskInput): Promise<Task> {
        const task = await this.repository.findById(input.taskId);

        if (!task) {
            throw new Error("Task not found");
        }

        if (task.props.creatorId !== input.creatorId) {
            throw new Error("Unauthorized");
        }

        const completedTask = task.complete();
        await this.repository.update(completedTask);

        return completedTask;
    }
}
