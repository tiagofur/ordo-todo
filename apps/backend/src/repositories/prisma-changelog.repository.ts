import { Injectable } from '@nestjs/common';
import {
  ChangelogEntry,
  ChangelogEntryProps,
  ChangelogType as CoreChangelogType,
} from '@ordo-todo/core';
import type { IChangelogRepository } from '@ordo-todo/core';
import { PrismaService } from '../database/prisma.service';
import {
  ChangelogEntry as PrismaChangelogEntry,
  ChangelogType as PrismaChangelogType,
} from '@prisma/client';

/**
 * Prisma implementation of the IChangelogRepository interface.
 */
@Injectable()
export class PrismaChangelogRepository implements IChangelogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<ChangelogEntry | null> {
    const entry = await this.prisma.changelogEntry.findUnique({
      where: { id },
    });

    return entry ? this.toDomain(entry) : null;
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    orderBy?: 'publishedAt' | 'createdAt';
    order?: 'asc' | 'desc';
  }): Promise<ChangelogEntry[]> {
    const entries = await this.prisma.changelogEntry.findMany({
      skip: params?.skip,
      take: params?.take,
      orderBy: params?.orderBy
        ? { [params.orderBy]: params.order ?? 'desc' }
        : { publishedAt: 'desc' },
    });

    return entries.map((e) => this.toDomain(e));
  }

  async findLatest(): Promise<ChangelogEntry | null> {
    const entry = await this.prisma.changelogEntry.findFirst({
      orderBy: { publishedAt: 'desc' },
      where: { publishedAt: { lte: new Date() } },
    });

    return entry ? this.toDomain(entry) : null;
  }

  async create(entry: ChangelogEntry): Promise<ChangelogEntry> {
    const created = await this.prisma.changelogEntry.create({
      data: {
        id: entry.id as string,
        version: entry.props.version ?? null,
        title: entry.props.title,
        content: entry.props.content,
        type: entry.props.type as PrismaChangelogType,
        publishedAt: entry.props.publishedAt,
      },
    });

    return this.toDomain(created);
  }

  async update(
    id: string,
    data: Partial<ChangelogEntryProps>,
  ): Promise<ChangelogEntry> {
    const updateData: Record<string, unknown> = {};

    if (data.version !== undefined) updateData.version = data.version;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.type !== undefined)
      updateData.type = data.type as PrismaChangelogType;
    if (data.publishedAt !== undefined)
      updateData.publishedAt = data.publishedAt;

    const updated = await this.prisma.changelogEntry.update({
      where: { id },
      data: updateData,
    });

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.changelogEntry.delete({ where: { id } });
  }

  private toDomain(prismaEntry: PrismaChangelogEntry): ChangelogEntry {
    return new ChangelogEntry({
      id: prismaEntry.id,
      version: prismaEntry.version ?? undefined,
      title: prismaEntry.title,
      content: prismaEntry.content,
      type: prismaEntry.type as CoreChangelogType,
      publishedAt: prismaEntry.publishedAt,
      createdAt: prismaEntry.createdAt,
      updatedAt: prismaEntry.updatedAt,
    });
  }
}
