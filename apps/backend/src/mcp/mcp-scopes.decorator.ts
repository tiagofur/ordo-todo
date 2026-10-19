import { SetMetadata } from '@nestjs/common';

export const MCP_SCOPES_KEY = 'mcpScopes';

/**
 * Scopes required to invoke the decorated MCP surface.
 * The guard reports ALL missing scopes at once for step-up flows.
 */
export const RequireMcpScopes = (...scopes: string[]) =>
  SetMetadata(MCP_SCOPES_KEY, scopes);
