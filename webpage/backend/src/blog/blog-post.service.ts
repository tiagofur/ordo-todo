import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@ordo-todo/db';

@Injectable()
export class BlogPostService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.BlogPostCreateInput) {
    return this.prisma.blogPost.create({ data });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.BlogPostWhereUniqueInput;
    where?: Prisma.BlogPostWhereInput;
    orderBy?: Prisma.BlogPostOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.blogPost.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async findOne(slug: string) {
    return this.prisma.blogPost.findUnique({
      where: { slug },
    });
  }
}
