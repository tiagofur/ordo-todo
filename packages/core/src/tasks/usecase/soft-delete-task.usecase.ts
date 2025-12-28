import { TaskRepository } from "../provider/task.repository";

export class SoftDeleteTaskUseCase {
  constructor(private taskRepository: TaskRepository) {}

  async execute(id: string): Promise<void> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new Error("Task not found");
    }

    await this.taskRepository.softDelete(id);
  }
}
