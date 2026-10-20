import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { LLM_PROVIDER } from '../llm/llm-provider.interface';
import type { LlmProvider } from '../llm/llm-provider.interface';
import type { IndexableContentType } from './embedding-indexer.service';

export interface Citation {
  type: IndexableContentType;
  id: string;
  title: string;
  excerpt: string;
}

interface VectorCandidate {
  contentType: string;
  contentId: string;
  content: string;
}

const VECTOR_CANDIDATE_LIMIT = 50;
const EXCERPT_CHARS = 200;
const TITLE_CHARS = 60;

/**
 * Two-phase retrieval (ODD 004 S2): vector candidates first, then permission
 * verification against the real tables. Leaks are impossible by construction:
 * only rows the permission check returns become citations.
 */
@Injectable()
export class RetrievalService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(LLM_PROVIDER) private readonly llm: LlmProvider,
  ) {}

  async retrieve(
    userId: string,
    query: string,
    limit = 8,
  ): Promise<Citation[]> {
    if (!query.trim()) {
      return [];
    }

    const [queryVector] = await this.llm.embed([query]);
    if (!queryVector?.length) {
      return [];
    }

    const candidates = await this.prisma.$queryRaw<VectorCandidate[]>`
      SELECT "contentType", "contentId", "content"
      FROM "AiEmbedding"
      WHERE "embedding" IS NOT NULL
      ORDER BY "embedding" <=> ${toVectorLiteral(queryVector)}::vector
      LIMIT ${VECTOR_CANDIDATE_LIMIT}
    `;
    if (candidates.length === 0) {
      return [];
    }

    const visible = await this.resolveVisible(userId, candidates);

    const citations: Citation[] = [];
    for (const candidate of candidates) {
      if (citations.length >= limit) {
        break;
      }
      const citation = visible.get(
        `${candidate.contentType}:${candidate.contentId}`,
      );
      if (citation) {
        citations.push(citation);
      }
    }
    return citations;
  }

  /**
   * Verifies candidates in one batched query per content type, preserving the
   * canonical visibility semantics of each domain model.
   */
  private async resolveVisible(
    userId: string,
    candidates: VectorCandidate[],
  ): Promise<Map<string, Citation>> {
    const byType = new Map<string, { id: string; content: string }[]>();
    for (const candidate of candidates) {
      const group = byType.get(candidate.contentType) ?? [];
      group.push({ id: candidate.contentId, content: candidate.content });
      byType.set(candidate.contentType, group);
    }

    const visible = new Map<string, Citation>();
    for (const [contentType, group] of byType) {
      if (!isIndexableType(contentType)) {
        continue;
      }
      const ids = group.map((g) => g.id);
      const contents = new Map(group.map((g) => [g.id, g.content]));
      switch (contentType) {
        case 'TASK': {
          const rows = await this.prisma.task.findMany({
            where: { id: { in: ids }, ...taskVisibility(userId) },
            select: { id: true, title: true },
          });
          for (const row of rows) {
            visible.set(`TASK:${row.id}`, {
              type: 'TASK',
              id: row.id,
              title: row.title,
              excerpt: excerptOf(contents.get(row.id) ?? ''),
            });
          }
          break;
        }
        case 'PROJECT': {
          const rows = await this.prisma.project.findMany({
            where: {
              id: { in: ids },
              isDeleted: false,
              workspace: {
                isDeleted: false,
                members: { some: { userId } },
              },
            },
            select: { id: true, name: true },
          });
          for (const row of rows) {
            visible.set(`PROJECT:${row.id}`, {
              type: 'PROJECT',
              id: row.id,
              title: row.name,
              excerpt: excerptOf(contents.get(row.id) ?? ''),
            });
          }
          break;
        }
        case 'NOTE': {
          const rows = await this.prisma.note.findMany({
            where: {
              id: { in: ids },
              workspace: {
                isDeleted: false,
                members: { some: { userId } },
              },
            },
            select: { id: true, content: true },
          });
          for (const row of rows) {
            visible.set(`NOTE:${row.id}`, {
              type: 'NOTE',
              id: row.id,
              title: excerptOf(row.content, TITLE_CHARS),
              excerpt: excerptOf(contents.get(row.id) ?? ''),
            });
          }
          break;
        }
        case 'COMMENT': {
          const rows = await this.prisma.comment.findMany({
            where: {
              id: { in: ids },
              task: { ...taskVisibility(userId) },
            },
            select: { id: true, content: true },
          });
          for (const row of rows) {
            visible.set(`COMMENT:${row.id}`, {
              type: 'COMMENT',
              id: row.id,
              title: excerptOf(row.content, TITLE_CHARS),
              excerpt: excerptOf(contents.get(row.id) ?? ''),
            });
          }
          break;
        }
        case 'HABIT': {
          const rows = await this.prisma.habit.findMany({
            where: { id: { in: ids }, userId },
            select: { id: true, name: true },
          });
          for (const row of rows) {
            visible.set(`HABIT:${row.id}`, {
              type: 'HABIT',
              id: row.id,
              title: row.name,
              excerpt: excerptOf(contents.get(row.id) ?? ''),
            });
          }
          break;
        }
      }
    }
    return visible;
  }
}

/**
 * Canonical task visibility, copied from
 * `repositories/task.repository.ts` findByWorkspaceMemberships: owned,
 * assigned, or in a non-deleted workspace the user belongs to; never deleted.
 */
function taskVisibility(userId: string) {
  return {
    isDeleted: false,
    OR: [
      { ownerId: userId },
      { assigneeId: userId },
      {
        project: {
          workspace: {
            members: {
              some: {
                userId,
                workspace: { isDeleted: false },
              },
            },
          },
        },
      },
    ],
  };
}

function isIndexableType(value: string): value is IndexableContentType {
  return (
    value === 'TASK' ||
    value === 'PROJECT' ||
    value === 'NOTE' ||
    value === 'COMMENT' ||
    value === 'HABIT'
  );
}

function excerptOf(text: string, maxChars = EXCERPT_CHARS): string {
  return text.slice(0, maxChars);
}

function toVectorLiteral(vector: number[]): string {
  const safe = vector.map((v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) {
      throw new Error('Non-finite query embedding value');
    }
    return n;
  });
  return `[${safe.join(',')}]`;
}
