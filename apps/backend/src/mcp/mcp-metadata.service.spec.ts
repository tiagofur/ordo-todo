import { Test, TestingModule } from '@nestjs/testing';
import { McpMetadataService } from './mcp-metadata.service';

describe('McpMetadataService', () => {
  let service: McpMetadataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [McpMetadataService],
    }).compile();

    service = module.get<McpMetadataService>(McpMetadataService);
  });

  it('should expose RFC 9728 protected resource metadata', () => {
    const metadata = service.getProtectedResourceMetadata(
      'https://api.ordo.test',
    );

    expect(metadata).toEqual({
      resource: 'https://api.ordo.test/mcp',
      authorization_servers: ['https://api.ordo.test'],
      scopes_supported: [
        'read',
        'tasks:write',
        'projects:write',
        'admin:webhooks',
      ],
      bearer_methods_supported: ['header'],
      resource_signing_alg_values_supported: ['HS256'],
    });
  });

  it('should build issuer URLs without double slashes', () => {
    const metadata = service.getProtectedResourceMetadata(
      'https://api.ordo.test/',
    );

    expect(metadata.resource).toBe('https://api.ordo.test/mcp');
  });
});
