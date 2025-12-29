import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateChangelogDto } from './dto/create-changelog.dto';
import { UpdateChangelogDto } from './dto/update-changelog.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ChangelogService {
    constructor(private prisma: PrismaService) { }

    async create(data: CreateChangelogDto) {
        return this.prisma.changelogEntry.create({
            data: {
                ...data,
                publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
            },
        });
    }

    async findAll(params: {
        skip?: number;
        take?: number;
        where?: Prisma.ChangelogEntryWhereInput;
        orderBy?: Prisma.ChangelogEntryOrderByWithRelationInput;
    }) {
        const { skip, take, where, orderBy } = params;
        return this.prisma.changelogEntry.findMany({
            skip,
            take,
            where,
            orderBy,
        });
    }

    async findOne(id: string) {
        const entry = await this.prisma.changelogEntry.findUnique({
            where: { id },
        });

        if (!entry) {
            throw new NotFoundException(`Changelog entry with ID '${id}' not found`);
        }

        return entry;
    }

    async update(id: string, data: UpdateChangelogDto) {
        try {
            return await this.prisma.changelogEntry.update({
                where: { id },
                data: {
                    ...data,
                    publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
                },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new NotFoundException(`Changelog entry with ID '${id}' not found`);
            }
            throw error;
        }
    }

    async delete(id: string) {
        try {
            return await this.prisma.changelogEntry.delete({
                where: { id },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new NotFoundException(`Changelog entry with ID '${id}' not found`);
            }
            throw error;
        }
    }

    async getLatestRelease() {
        return this.prisma.changelogEntry.findFirst({
            orderBy: { publishedAt: 'desc' },
            where: { publishedAt: { lte: new Date() } }
        });
    }
}
