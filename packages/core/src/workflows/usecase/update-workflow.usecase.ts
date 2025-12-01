import { UseCase } from "../../shared/use-case";
import { Workflow } from "../model/workflow.entity";
import { WorkflowRepository } from "../provider/workflow.repository";

interface UpdateWorkflowInput {
    id: string;
    name?: string;
    description?: string;
    color?: string;
    icon?: string;
    position?: number;
}

export class UpdateWorkflowUseCase implements UseCase<UpdateWorkflowInput, Workflow> {
    constructor(private readonly workflowRepository: WorkflowRepository) { }

    async execute(input: UpdateWorkflowInput): Promise<Workflow> {
        const workflow = await this.workflowRepository.findById(input.id);

        if (!workflow) {
            throw new Error("Workflow not found");
        }

        const updatedWorkflow = workflow.update({
            name: input.name,
            description: input.description,
            color: input.color,
            icon: input.icon,
            position: input.position,
        });

        await this.workflowRepository.update(updatedWorkflow);

        return updatedWorkflow;
    }
}
