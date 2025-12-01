import { Task } from "../model/task.entity";

export interface TaskRepository {
    save(task: Task): Promise<void>;
    findById(id: string): Promise<Task | null>;
    findByCreatorId(creatorId: string, filters?: { projectId?: string; tags?: string[] }): Promise<Task[]>;
    update(task: Task): Promise<void>;
    delete(id: string): Promise<void>;
}
