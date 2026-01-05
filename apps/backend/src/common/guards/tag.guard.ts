import { Injectable } from '@nestjs/common';
import { BaseResourceGuard } from './base-resource.guard';

/**
 * Tag Guard - Protects tag endpoints
 *
 * Verifies that the user is a member of the workspace that owns the tag.
 * Supports multiple ways to determine workspace context:
 * - From tag ID (for update, delete operations)
 * - From workspaceId in body (for create operations)
 * - From workspaceId in query (for list operations)
 *
 * @example
 * ```typescript
 * @UseGuards(TagGuard)
 * @Roles(MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER)
 * update(@Param('id') id: string, @Body() dto: UpdateTagDto) {
 *   // TagGuard already verified user is a member of the tag's workspace
 *   return this.tagsService.update(id, dto);
 * }
 * ```
 */
@Injectable()
export class TagGuard extends BaseResourceGuard {
  protected async getWorkspaceId(request: any): Promise<string | null> {
    const tagId = request.params.id;
    const tagIdParam = request.params.tagId; // For /tags/:tagId/tasks/:taskId routes

    // 1. Try to get workspace from tag ID (for update/delete operations)
    const idToCheck = tagId || tagIdParam;

    if (idToCheck) {
      const tag = await this.prisma.tag.findUnique({
        where: { id: idToCheck },
        select: { workspaceId: true },
      });

      if (tag) {
        return tag.workspaceId;
      }
    }

    // 2. Try to get workspace from body (for create operations)
    if (request.body && request.body.workspaceId) {
      return request.body.workspaceId;
    }

    // 3. Try to get workspace from query (for list operations)
    if (request.query && request.query.workspaceId) {
      return request.query.workspaceId;
    }

    // 4. Cannot determine workspace context
    return null;
  }
}
