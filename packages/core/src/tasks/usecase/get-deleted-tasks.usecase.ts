import { TaskRepository } from "../provider/task.repository";
import { Task } from "../model/task.entity";

export class GetDeletedTasksUseCase {
  constructor(private taskRepository: TaskRepository) {}

  async execute(projectId: string): Promise<Task[]> {
    const tasks = await this.taskRepository.findDeleted(projectId);
    return tasks;
  }
}
