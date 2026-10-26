import { Controller, Get, Req } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { OAuthService } from './oauth.service';
import { Public } from '../common/decorators/public.decorator';

/**
 * RFC 8414 authorization-server metadata at the origin root.
 *
 * OAuth clients discover the AS from the protected-resource metadata,
 * which advertises the bare origin (`https://api.<domain>`), and then
 * probe `/.well-known/oauth-authorization-server` on that origin. The
 * AS keeps serving the rest of its routes under the API prefix
 * (`/api/v1/oauth/*`); only this discovery path must exist at the root.
 */
@ApiTags('OAuth')
@Controller('.well-known')
export class OAuthWellKnownController {
  constructor(private readonly oauthService: OAuthService) {}

  @Public()
  @Get('oauth-authorization-server')
  @ApiExcludeEndpoint()
  metadata(@Req() req: Request) {
    const host = req.get('host');
    return this.oauthService.getAuthorizationServerMetadata(
      `${req.protocol}://${host}`,
    );
  }
}
