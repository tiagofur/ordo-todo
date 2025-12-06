import { PrismaClient, Project as PrismaProject } from "@prisma/client";
import { Project, ProjectRepository } from "@ordo-todo/core";

export class PrismaProjectRepository implements ProjectRepository {
    constructor(private readonly prisma: PrismaClient) { }

    private toDomain(prismaProject: PrismaProject): Project {
        return new Project({
            id: prismaProject.id,
            name: prismaProject.name,
            slug: prismaProject.slug,
            description: prismaProject.description ?? undefined,
            color: prismaProject.color,
            icon: prismaProject.icon ?? undefined,
            workspaceId: prismaProject.workspaceId,
            workflowId: prismaProject.workflowId,
            position: prismaProject.position,
            archived: prismaProject.archived,
            completed: prismaProject.completed,
            completedAt: prismaProject.completedAt ?? undefined,
            createdAt: prismaProject.createdAt,
            updatedAt: prismaProject.updatedAt,
        });
    }

    async create(project: Project): Promise<Project> {
        const data = {
            id: project.id as string,
            name: project.props.name,
            slug: project.props.slug,
            description: project.props.description ?? null,
            color: project.props.color,
            icon: project.props.icon ?? null,
            workspaceId: project.props.workspaceId,
            workflowId: project.props.workflowId,
            position: project.props.position,
            archived: project.props.archived,
            completed: project.props.completed,
            completedAt: project.props.completedAt ?? null,
            updatedAt: project.props.updatedAt,
        };

        const created = await this.prisma.project.create({
            data: data,
        });

        return this.toDomain(created);
    }

    async findById(id: string): Promise<Project | null> {
        const project = await this.prisma.project.findUnique({ where: { id } });
        if (!project) return null;
        return this.toDomain(project);
    }

    async findBySlug(slug: string, workspaceId: string): Promise<Project | null> {
        const project = await this.prisma.project.findUnique({
            where: {
                workspaceId_slug: {
                    workspaceId,
                    slug,
                },
            },
        });
        return project ? this.toDomain(project) : null;
    }

    async findByWorkspaceId(workspaceId: string): Promise<Project[]> {
        const projects = await this.prisma.project.findMany({ where: { workspaceId } });
        return projects.map(p => this.toDomain(p));
    }

    async findAllByUserId(userId: string): Promise<Project[]> {
        const projects = await this.prisma.project.findMany({
            where: {
                workspace: {
                    members: {
                        some: {
                            userId: userId
                        }
                    }
                }
            }
        });
        return projects.map(p => this.toDomain(p));
    }

    async update(project: Project): Promise<Project> {
        const data = {
            name: project.props.name,
            slug: project.props.slug,
            description: project.props.description ?? null,
            color: project.props.color,
            icon: project.props.icon ?? null,
            workspaceId: project.props.workspaceId,
            workflowId: project.props.workflowId,
            position: project.props.position,
            archived: project.props.archived,
            completed: project.props.completed,
            completedAt: project.props.completedAt ?? null,
            updatedAt: project.props.updatedAt,
        };

        const updated = await this.prisma.project.update({
            where: { id: project.id as string },
            data: data,
        });

        return this.toDomain(updated);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.project.delete({ where: { id } });
    }
}
