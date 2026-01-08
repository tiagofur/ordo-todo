import { PrismaClient } from "@prisma/client";
import { Workflow, WorkflowRepository } from "@ordo-todo/core";

export class PrismaWorkflowRepository implements WorkflowRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async save(workflow: Workflow): Promise<void> {
        await this.prisma.workflow.create({
            data: {
                id: workflow.id as any,
                name: workflow.props.name,
                description: workflow.props.description,
                color: workflow.props.color,
                icon: workflow.props.icon,
                workspaceId: workflow.props.workspaceId,
                position: workflow.props.position,
            },
        });
    }

    async findById(id: string): Promise<Workflow | null> {
        const data = await this.prisma.workflow.findUnique({ where: { id } });
        return data ? new Workflow({
            ...data,
            description: data.description === null ? undefined : data.description,
            icon: data.icon === null ? undefined : data.icon,
        }) : null;
    }

    async findByWorkspaceId(workspaceId: string): Promise<Workflow[]> {
        const data = await this.prisma.workflow.findMany({
            where: { workspaceId },
            orderBy: { position: "asc" },
        });
        return data.map((d: any) => new Workflow({
            ...d,
            description: d.description === null ? undefined : d.description,
            icon: d.icon === null ? undefined : d.icon,
        }));
    }

    async update(workflow: Workflow): Promise<void> {
        await this.prisma.workflow.update({
            where: { id: String(workflow.id) },
            data: {
                name: workflow.props.name,
                description: workflow.props.description,
                color: workflow.props.color,
                icon: workflow.props.icon,
                position: workflow.props.position,
            },
        });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.workflow.delete({ where: { id } });
    }
}
