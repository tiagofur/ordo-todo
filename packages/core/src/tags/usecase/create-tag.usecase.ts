import { Tag, TagProps } from "../model/tag.entity";
import { TagRepository } from "../provider/tag.repository";

export class CreateTagUseCase {
    constructor(private tagRepository: TagRepository) { }

    async execute(props: Omit<TagProps, "id" | "createdAt">): Promise<Tag> {
        const tag = Tag.create(props);
        return this.tagRepository.create(tag);
    }
}
