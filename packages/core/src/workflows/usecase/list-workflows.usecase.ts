import { UseCase } from "../../shared/use-case";
import { Workflow } from "../model/workflow.entity";
import { WorkflowRepository } from "../provider/workflow.repository";

export class ListWorkflowsUseCase implements UseCase<string, Workflow[]> {
    constructor(private readonly workflowRepository: WorkflowRepository) { }

    async execute(workspaceId: string): Promise<Workflow[]> {
        return this.workflowRepository.findByWorkspaceId(workspaceId);
    }
}
