import { SetMetadata } from '@nestjs/common';

export const WORKSPACE_CONTEXT_KEY = 'workspaceContext';

export type WorkspaceContextType = 'direct' | 'from-project' | 'from-task';

export interface WorkspaceContextConfig {
  /**
   * Tipo de contexto de workspace
   * - 'direct': El ID del workspace está en los params
   * - 'from-project': Necesita buscar el workspace desde el projectId
   * - 'from-task': Necesita buscar el workspace desde el taskId
   */
  type: WorkspaceContextType;

  /**
   * Nombre del parámetro que contiene el ID
   * Por defecto: 'id' para direct, 'projectId' o 'taskId' según tipo
   */
  paramName?: string;
}

/**
 * Marca un endpoint como que requiere contexto de workspace
 *
 * @example
 * @WorkspaceContext({ type: 'direct', paramName: 'id' })
 * @Get(':id')
 * findOne(@Param('id') id: string) { ... }
 *
 * @WorkspaceContext({ type: 'from-project', paramName: 'projectId' })
 * @Get('projects/:projectId/tasks')
 * getTasks(@Param('projectId') projectId: string) { ... }
 */
export const WorkspaceContext = (config: WorkspaceContextConfig) =>
  SetMetadata(WORKSPACE_CONTEXT_KEY, config);
