import { Injectable } from '@nestjs/common';
import {
    ContactSubmission,
    ContactSubmissionProps,
} from '@ordo-todo/core';
import type { IContactRepository } from '@ordo-todo/core';
import { PrismaService } from '../database/prisma.service';
import { ContactSubmission as PrismaContactSubmission } from '@prisma/client';

/**
 * Prisma implementation of the IContactRepository interface.
 */
@Injectable()
export class PrismaContactRepository implements IContactRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findById(id: string): Promise<ContactSubmission | null> {
        const submission = await this.prisma.contactSubmission.findUnique({
            where: { id },
        });

        return submission ? this.toDomain(submission) : null;
    }

    async findAll(params?: {
        skip?: number;
        take?: number;
        unreadOnly?: boolean;
    }): Promise<ContactSubmission[]> {
        const submissions = await this.prisma.contactSubmission.findMany({
            skip: params?.skip,
            take: params?.take,
            where: params?.unreadOnly ? { read: false } : undefined,
            orderBy: { createdAt: 'desc' },
        });

        return submissions.map((s) => this.toDomain(s));
    }

    async create(submission: ContactSubmission): Promise<ContactSubmission> {
        const created = await this.prisma.contactSubmission.create({
            data: {
                id: submission.id as string,
                name: submission.props.name,
                email: submission.props.email,
                subject: submission.props.subject,
                message: submission.props.message,
                read: submission.props.read,
            },
        });

        return this.toDomain(created);
    }

    async update(
        id: string,
        data: Partial<ContactSubmissionProps>,
    ): Promise<ContactSubmission> {
        const updateData: Record<string, unknown> = {};

        if (data.name !== undefined) updateData.name = data.name;
        if (data.email !== undefined) updateData.email = data.email;
        if (data.subject !== undefined) updateData.subject = data.subject;
        if (data.message !== undefined) updateData.message = data.message;
        if (data.read !== undefined) updateData.read = data.read;

        const updated = await this.prisma.contactSubmission.update({
            where: { id },
            data: updateData,
        });

        return this.toDomain(updated);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.contactSubmission.delete({ where: { id } });
    }

    private toDomain(
        prismaSubmission: PrismaContactSubmission,
    ): ContactSubmission {
        return new ContactSubmission({
            id: prismaSubmission.id,
            name: prismaSubmission.name,
            email: prismaSubmission.email,
            subject: prismaSubmission.subject,
            message: prismaSubmission.message,
            read: prismaSubmission.read,
            createdAt: prismaSubmission.createdAt,
        });
    }
}
