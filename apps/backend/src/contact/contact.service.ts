import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ContactService {
    constructor(private prisma: PrismaService) { }

    async create(data: CreateContactDto) {
        return this.prisma.contactSubmission.create({
            data,
        });
    }

    async findAll(params: {
        skip?: number;
        take?: number;
        where?: Prisma.ContactSubmissionWhereInput;
        orderBy?: Prisma.ContactSubmissionOrderByWithRelationInput;
    }) {
        const { skip, take, where, orderBy } = params;
        return this.prisma.contactSubmission.findMany({
            skip,
            take,
            where,
            orderBy,
        });
    }

    async findOne(id: string) {
        const submission = await this.prisma.contactSubmission.findUnique({
            where: { id },
        });

        if (!submission) {
            throw new NotFoundException(`Contact submission with ID '${id}' not found`);
        }

        return submission;
    }

    async update(id: string, data: UpdateContactDto) {
        try {
            return await this.prisma.contactSubmission.update({
                where: { id },
                data,
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new NotFoundException(`Contact submission with ID '${id}' not found`);
            }
            throw error;
        }
    }

    async delete(id: string) {
        try {
            return await this.prisma.contactSubmission.delete({
                where: { id },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new NotFoundException(`Contact submission with ID '${id}' not found`);
            }
            throw error;
        }
    }
}
