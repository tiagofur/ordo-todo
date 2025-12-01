import { Workflow } from "../model/workflow.entity";

export interface WorkflowRepository {
    save(workflow: Workflow): Promise<void>;
    findById(id: string): Promise<Workflow | null>;
    findByWorkspaceId(workspaceId: string): Promise<Workflow[]>;
    update(workflow: Workflow): Promise<void>;
    delete(id: string): Promise<void>;
}
