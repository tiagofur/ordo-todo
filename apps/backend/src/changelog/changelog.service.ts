import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ChangelogEntry } from '@ordo-todo/core';
import type { IChangelogRepository } from '@ordo-todo/core';
import { CreateChangelogDto } from './dto/create-changelog.dto';
import { UpdateChangelogDto } from './dto/update-changelog.dto';

@Injectable()
export class ChangelogService {
  constructor(
    @Inject('ChangelogRepository')
    private readonly changelogRepository: IChangelogRepository,
  ) {}

  async create(data: CreateChangelogDto) {
    const entry = ChangelogEntry.create({
      version: data.version,
      title: data.title,
      content: data.content,
      type: data.type ?? 'NEW',
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
    });

    return this.changelogRepository.create(entry);
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    orderBy?: 'publishedAt' | 'createdAt';
  }) {
    return this.changelogRepository.findAll({
      skip: params.skip,
      take: params.take,
      orderBy: params.orderBy,
      order: 'desc',
    });
  }

  async findOne(id: string) {
    const entry = await this.changelogRepository.findById(id);

    if (!entry) {
      throw new NotFoundException(`Changelog entry with ID '${id}' not found`);
    }

    return entry;
  }

  async update(id: string, data: UpdateChangelogDto) {
    // Verify entry exists
    await this.findOne(id);

    return this.changelogRepository.update(id, {
      version: data.version,
      title: data.title,
      content: data.content,
      type: data.type,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
    });
  }

  async delete(id: string) {
    // Verify entry exists
    await this.findOne(id);

    await this.changelogRepository.delete(id);
    return { success: true };
  }

  async getLatestRelease() {
    return this.changelogRepository.findLatest();
  }
}
