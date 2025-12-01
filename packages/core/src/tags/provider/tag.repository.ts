import { Tag } from "../model/tag.entity";

export interface TagRepository {
    create(tag: Tag): Promise<Tag>;
    findById(id: string): Promise<Tag | null>;
    findByWorkspaceId(workspaceId: string): Promise<Tag[]>;
    delete(id: string): Promise<void>;

    // Task assignment
    assignToTask(tagId: string, taskId: string): Promise<void>;
    removeFromTask(tagId: string, taskId: string): Promise<void>;
    findByTaskId(taskId: string): Promise<Tag[]>;
}
