import { AsyncLocalStorage } from 'node:async_hooks';

export interface McpRequestContext {
  userId: string;
  scopes: string[];
  clientId?: string;
  tokenId?: string;
}

const storage = new AsyncLocalStorage<McpRequestContext>();

/**
 * Runs `fn` with the authenticated MCP request context.
 *
 * Set by the MCP controller after {@link McpAuthGuard} populates
 * `request.user` / `request.mcpScopes`; read by every domain tool
 * to scope operations to the token owner.
 */
export function runWithMcpContext<T>(
  context: McpRequestContext,
  fn: () => T,
): T {
  return storage.run(context, fn);
}

/**
 * Returns the current MCP request context.
 *
 * @throws Error with `MCP_UNAUTHENTICATED` code when called outside
 * an authenticated request (tools convert this to a JSON-RPC error).
 */
export function mcpContext(): McpRequestContext {
  const context = storage.getStore();
  if (!context) {
    const error = new Error('No authenticated MCP request context') as Error & {
      code: string;
    };
    error.code = 'MCP_UNAUTHENTICATED';
    throw error;
  }
  return context;
}
