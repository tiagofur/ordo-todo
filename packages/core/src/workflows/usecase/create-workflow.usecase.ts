import { UseCase } from "../../shared/use-case";
import { Workflow } from "../model/workflow.entity";
import { WorkflowRepository } from "../provider/workflow.repository";

interface CreateWorkflowInput {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    workspaceId: string;
}

export class CreateWorkflowUseCase implements UseCase<CreateWorkflowInput, Workflow> {
    constructor(private readonly workflowRepository: WorkflowRepository) { }

    async execute(input: CreateWorkflowInput): Promise<Workflow> {
        const workflow = Workflow.create({
            name: input.name,
            description: input.description,
            color: input.color ?? "#6B7280",
            icon: input.icon,
            workspaceId: input.workspaceId,
        });

        await this.workflowRepository.save(workflow);

        return workflow;
    }
}
