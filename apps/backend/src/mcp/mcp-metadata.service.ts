import { Injectable } from '@nestjs/common';
import { API_TOKEN_SCOPES } from '../api-tokens/api-token.constants';

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
      scopes_supported: [...API_TOKEN_SCOPES],
      bearer_methods_supported: ['header'],
      resource_signing_alg_values_supported: ['HS256'],
    };
  }
}
