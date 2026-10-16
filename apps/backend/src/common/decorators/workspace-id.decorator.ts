import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Param decorator to extract the workspaceId from the request.
 * The workspaceId should be provided as a header 'x-workspace-id' or query param 'workspaceId'.
 *
 * @example
 * @Get()
 * findAll(@WorkspaceId() workspaceId: string) { ... }
 */
export const WorkspaceId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();

    // Try to get from header first (preferred)
    const headerWorkspaceId = request.headers['x-workspace-id'];
    if (headerWorkspaceId) {
      return headerWorkspaceId as string;
    }

    // Fall back to query param
    const queryWorkspaceId = request.query?.workspaceId;
    if (queryWorkspaceId) {
      return queryWorkspaceId as string;
    }

    // Fall back to body (for POST requests)
    const bodyWorkspaceId = request.body?.workspaceId;
    if (bodyWorkspaceId) {
      return bodyWorkspaceId as string;
    }

    // If attached by a guard
    if (request.workspaceId) {
      return request.workspaceId as string;
    }

    throw new Error(
      'WorkspaceId not found. Please provide x-workspace-id header or workspaceId query param.',
    );
  },
);
