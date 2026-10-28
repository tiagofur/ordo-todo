import { TaskRepository } from "../provider/task.repository";
import { Task } from "../model/task.entity";

export class GetDeletedTasksUseCase {
  constructor(private taskRepository: TaskRepository) {}

  /**
   * @param projectId project whose deleted tasks to list; null lists the
   * user's own deleted tasks without a project (ODD 021)
   */
  async execute(projectId: string | null, userId?: string): Promise<Task[]> {
    const tasks = await this.taskRepository.findDeleted(projectId, userId);
    return tasks;
  }
}
