import { UseCase } from "../../shared/use-case";
import { WorkflowRepository } from "../provider/workflow.repository";

export class DeleteWorkflowUseCase implements UseCase<string, void> {
    constructor(private readonly workflowRepository: WorkflowRepository) { }

    async execute(id: string): Promise<void> {
        await this.workflowRepository.delete(id);
    }
}
