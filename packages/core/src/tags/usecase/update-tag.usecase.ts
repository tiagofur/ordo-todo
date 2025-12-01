import { Tag, TagProps } from "../model/tag.entity";
import { TagRepository } from "../provider/tag.repository";

export class UpdateTagUseCase {
    constructor(private tagRepository: TagRepository) { }

    async execute(id: string, props: Partial<Omit<TagProps, "id" | "workspaceId" | "createdAt">>): Promise<Tag> {
        const tag = await this.tagRepository.findById(id);
        if (!tag) {
            throw new Error("Tag not found");
        }

        const updatedTag = tag.update(props);
        return this.tagRepository.update(updatedTag);
    }
}
