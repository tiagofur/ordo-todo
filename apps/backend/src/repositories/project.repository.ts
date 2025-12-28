import { Injectable } from '@nestjs/common';
import { Project as PrismaProject } from '@prisma/client';
import { Project, ProjectRepository } from '@ordo-todo/core';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PrismaProjectRepository implements ProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

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
      isDeleted: prismaProject.isDeleted,
      deletedAt: prismaProject.deletedAt ?? undefined,
      createdAt: prismaProject.createdAt,
      updatedAt: prismaProject.updatedAt,
    });
  }

  async create(project: Project): Promise<Project> {
    const data = {
      id: project.id as string,
      name: project.props.name,
      slug: project.props.slug,
      description: project.props.description,
      color: project.props.color,
      icon: project.props.icon,
      workspaceId: project.props.workspaceId,
      workflowId: project.props.workflowId,
      position: project.props.position,
      archived: project.props.archived,
      completed: project.props.completed,
      completedAt: project.props.completedAt,
      isDeleted: project.props.isDeleted ?? false,
      deletedAt: project.props.deletedAt ?? null,
      updatedAt: project.props.updatedAt,
    };

    const created = await this.prisma.project.create({
      data: data,
    });

    return this.toDomain(created);
  }

  async findById(id: string): Promise<Project | null> {
    const project = await this.prisma.project.findFirst({
      where: { id, isDeleted: false },
    });
    if (!project) return null;
    return this.toDomain(project);
  }

  async findBySlug(slug: string, workspaceId: string): Promise<Project | null> {
    const project = await this.prisma.project.findFirst({
      where: {
        workspaceId,
        slug,
        isDeleted: false,
      },
    });
    if (!project) return null;
    return this.toDomain(project);
  }

  async findByWorkspaceId(workspaceId: string): Promise<Project[]> {
    const projects = await this.prisma.project.findMany({
      where: { workspaceId, isDeleted: false },
    });
    return projects.map((p) => this.toDomain(p));
  }

  async findAllByUserId(userId: string): Promise<Project[]> {
    const projects = await this.prisma.project.findMany({
      where: {
        isDeleted: false,
        workspace: {
          members: {
            some: {
              userId: userId,
            },
          },
        },
      },
    });
    return projects.map((p) => this.toDomain(p));
  }

  async update(project: Project): Promise<Project> {
    const data = {
      name: project.props.name,
      slug: project.props.slug,
      description: project.props.description,
      color: project.props.color,
      icon: project.props.icon,
      workspaceId: project.props.workspaceId,
      workflowId: project.props.workflowId,
      position: project.props.position,
      archived: project.props.archived,
      completed: project.props.completed,
      completedAt: project.props.completedAt,
      isDeleted: project.props.isDeleted,
      deletedAt: project.props.deletedAt,
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

  async softDelete(id: string): Promise<void> {
    await this.prisma.project.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async restore(id: string): Promise<void> {
    await this.prisma.project.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });
  }

  async permanentDelete(id: string): Promise<void> {
    await this.prisma.project.delete({ where: { id } });
  }

  async findDeleted(workspaceId: string): Promise<Project[]> {
    const projects = await this.prisma.project.findMany({
      where: {
        workspaceId,
        isDeleted: true,
      },
    });
    return projects.map((p) => this.toDomain(p));
  }
}
