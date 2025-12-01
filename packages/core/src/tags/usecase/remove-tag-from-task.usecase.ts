import { TagRepository } from "../provider/tag.repository";

export class RemoveTagFromTaskUseCase {
    constructor(private tagRepository: TagRepository) { }

    async execute(tagId: string, taskId: string): Promise<void> {
        await this.tagRepository.removeFromTask(tagId, taskId);
    }
}
