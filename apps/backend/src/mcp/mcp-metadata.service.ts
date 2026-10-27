import { Injectable } from '@nestjs/common';
import { API_TOKEN_SCOPES } from '../api-tokens/api-token.constants';

/**
 * Scopes the MCP resource itself uses. Deliberately narrower than the
 * PAT vocabulary: `admin:webhooks` is PAT-only, and Claude requests
 * everything listed here verbatim on /authorize.
 */
export const MCP_RESOURCE_SCOPES = API_TOKEN_SCOPES.filter(
  (scope) => scope !== 'admin:webhooks',
);

export interface ProtectedResourceMetadata {
  resource: string;
  authorization_servers: string[];
  scopes_supported: string[];
  bearer_methods_supported: string[];
  resource_signing_alg_values_supported: string[];
}

/**
 * RFC 9728 Protected Resource Metadata for the MCP endpoint.
 *
 * Published at `/.well-known/oauth-protected-resource` so OAuth
 * clients (Claude, ChatGPT, Hermes, OpenClaw…) discover the
 * authorization server, supported scopes and bearer rules without
 * manual configuration.
 */
@Injectable()
export class McpMetadataService {
  getProtectedResourceMetadata(issuer: string): ProtectedResourceMetadata {
    const base = issuer.replace(/\/$/, '');

    return {
      resource: `${base}/mcp`,
      authorization_servers: [base],
      scopes_supported: [...MCP_RESOURCE_SCOPES],
      bearer_methods_supported: ['header'],
      resource_signing_alg_values_supported: ['HS256'],
    };
  }
}
