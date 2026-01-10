import { TaskRepository } from "../provider/task.repository";

export class PermanentDeleteTaskUseCase {
  constructor(private taskRepository: TaskRepository) { }

  async execute(id: string): Promise<void> {
    const task = await this.taskRepository.findByIdIncludeDeleted(id);
    if (!task) {
      throw new Error("Task not found");
    }

    if (!task.props.isDeleted) {
      throw new Error("Task must be soft deleted first");
    }

    await this.taskRepository.permanentDelete(id);
  }
}
