/**
 * EJEMPLO: Validación de parámetros UUID
 * Agregar a todos los endpoints que reciben IDs
 */

import { ParseUUIDPipe } from '@nestjs/common';

// ANTES (sin validación):
@Get(':id')
findOne(@Param('id') id: string) {
  return this.workspacesService.findOne(id);
}

// DESPUÉS (con validación):
@Get(':id')
findOne(@Param('id', ParseUUIDPipe) id: string) {
  return this.workspacesService.findOne(id);
}

// Para múltiples parámetros:
@Delete(':id/members/:userId')
removeMember(
  @Param('id', ParseUUIDPipe) workspaceId: string,
  @Param('userId', ParseUUIDPipe) userId: string,
) {
  return this.workspacesService.removeMember(workspaceId, userId);
}

/**
 * BENEFICIOS:
 * - Valida formato UUID automáticamente
 * - Retorna error 400 si el formato es inválido
 * - Evita queries innecesarias a la base de datos
 * - Mejora seguridad y previene inyecciones
 */
