import { TaskRepository } from "../provider/task.repository";

export class RestoreTaskUseCase {
  constructor(private taskRepository: TaskRepository) {}

  async execute(id: string): Promise<void> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new Error("Task not found");
    }

    if (!task.props.isDeleted) {
      throw new Error("Task is not deleted");
    }

    await this.taskRepository.restore(id);
  }
}
