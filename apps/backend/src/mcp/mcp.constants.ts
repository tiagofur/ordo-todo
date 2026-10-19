export const MCP_SERVER_NAME = 'ordo-mcp';
export const MCP_SERVER_VERSION = '0.1.0';

/**
 * Protocol versions this server speaks, newest first.
 * The SDK negotiates the highest version both sides support.
 */
export const MCP_PROTOCOL_VERSIONS = ['2025-06-18', '2025-03-26'] as const;
