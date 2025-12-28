import { TaskRepository } from "../provider/task.repository";

export class GetDeletedTasksUseCase {
  constructor(private taskRepository: TaskRepository) {}

  async execute(projectId: string): Promise<any[]> {
    const tasks = await this.taskRepository.findDeleted(projectId);
    return tasks.map((t) => t.props);
  }
}
