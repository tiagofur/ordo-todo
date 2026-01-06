import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ContactSubmission } from '@ordo-todo/core';
import type { IContactRepository } from '@ordo-todo/core';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactService {
  constructor(
    @Inject('ContactRepository')
    private readonly contactRepository: IContactRepository,
  ) { }

  async create(data: CreateContactDto) {
    const submission = ContactSubmission.create({
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
    });

    return this.contactRepository.create(submission);
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    unreadOnly?: boolean;
  }) {
    return this.contactRepository.findAll({
      skip: params.skip,
      take: params.take,
      unreadOnly: params.unreadOnly,
    });
  }

  async findOne(id: string) {
    const submission = await this.contactRepository.findById(id);

    if (!submission) {
      throw new NotFoundException(
        `Contact submission with ID '${id}' not found`,
      );
    }

    return submission;
  }

  async update(id: string, data: UpdateContactDto) {
    // Verify submission exists
    await this.findOne(id);

    return this.contactRepository.update(id, {
      read: data.read,
    });
  }

  async delete(id: string) {
    // Verify submission exists
    await this.findOne(id);

    await this.contactRepository.delete(id);
    return { success: true };
  }

  async markAsRead(id: string) {
    await this.findOne(id);
    return this.contactRepository.update(id, { read: true });
  }

  async markAsUnread(id: string) {
    await this.findOne(id);
    return this.contactRepository.update(id, { read: false });
  }
}
