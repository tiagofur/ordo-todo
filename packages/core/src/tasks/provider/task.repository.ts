import { Task } from "../model/task.entity";

export interface TaskRepository {
  save(task: Task): Promise<void>;
  findById(id: string): Promise<Task | null>;
  findByOwnerId(
    ownerId: string,
    filters?: { projectId?: string; tags?: string[] },
  ): Promise<Task[]>;
  update(task: Task): Promise<void>;
  delete(id: string): Promise<void>;
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
  permanentDelete(id: string): Promise<void>;
  findDeleted(projectId: string): Promise<Task[]>;
}
