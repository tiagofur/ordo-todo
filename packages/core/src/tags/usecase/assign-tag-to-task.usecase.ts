import { TagRepository } from "../provider/tag.repository";

export class AssignTagToTaskUseCase {
    constructor(private tagRepository: TagRepository) { }

    async execute(tagId: string, taskId: string): Promise<void> {
        // Verify tag exists
        const tag = await this.tagRepository.findById(tagId);
        if (!tag) {
            throw new Error("Tag not found");
        }

        // We could also verify task exists if we had TaskRepository here, 
        // but usually the repo implementation will handle FK constraint errors.

        await this.tagRepository.assignToTask(tagId, taskId);
    }
}
