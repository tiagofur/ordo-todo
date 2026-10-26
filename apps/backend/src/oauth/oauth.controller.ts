import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { OAuthService } from './oauth.service';
import { OAuthGuard } from './oauth.guard';
import { OAuthAuthorizeGuard } from './oauth-authorize.guard';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/types/request-user.interface';
import { OAuthRevokeDto } from './dto/oauth-revoke.dto';

@ApiTags('OAuth')
@Controller('oauth')
export class OAuthController {
  constructor(private readonly oauthService: OAuthService) {}

  private asString(value: unknown): string {
    return typeof value === 'string' ? value : '';
  }

  private asStringOrUndefined(value: unknown): string | undefined {
    return typeof value === 'string' ? value : undefined;
  }

  @Public()
  @Get('.well-known/oauth-authorization-server')
  @ApiOperation({ summary: 'OAuth authorization server metadata (RFC 8414)' })
  metadata(@Req() req: Request) {
    const host = req.get('host');
    return this.oauthService.getAuthorizationServerMetadata(
      `${req.protocol}://${host}`,
    );
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      'Register an OAuth client (RFC 7591 DCR or Client ID Metadata Document)',
  })
  register(@Body() raw: Record<string, unknown>) {
    // Read straight off the body: third-party clients post extra RFC 7591
    // fields, and class-based validation here would reject the flow over
    // properties this endpoint never needs.
    const uris = Array.isArray(raw?.redirect_uris) ? raw.redirect_uris : [];
    return this.oauthService.registerClient(
      this.asStringOrUndefined(raw?.metadataUrl),
      {
        client_name: this.asString(raw?.client_name),
        redirect_uris: uris.filter(
          (uri): uri is string => typeof uri === 'string',
        ),
        scope: this.asStringOrUndefined(raw?.scope),
        client_uri: this.asStringOrUndefined(raw?.client_uri),
      },
    );
  }

  @Public()
  @UseGuards(OAuthAuthorizeGuard)
  @ApiBearerAuth()
  @Get('authorize')
  @ApiOperation({
    summary: 'Authorize an OAuth client (logged-in user approves)',
  })
  async authorize(
    @CurrentUser() user: RequestUser | undefined,
    @Query() query: Record<string, unknown>,
    @Res() res: Response,
  ): Promise<void> {
    // OAuthAuthorizeGuard already bounced the tab to the web login.
    if (!user) return;
    const { redirectUri } = await this.oauthService.authorize({
      userId: user.id,
      clientId: this.asString(query.client_id),
      redirectUri: this.asString(query.redirect_uri),
      scope: this.asString(query.scope),
      state: this.asString(query.state),
      codeChallenge: this.asString(query.code_challenge),
      codeChallengeMethod: this.asString(query.code_challenge_method),
    });
    res.redirect(redirectUri);
  }

  @Public()
  @Post('token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange code or refresh token (RFC 6749)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Token response.' })
  token(@Body() raw: Record<string, unknown>) {
    const str = (key: string) => this.asString(raw?.[key]);
    const grantType = str('grant_type');

    if (grantType === 'authorization_code') {
      const code = str('code');
      const clientId = str('client_id');
      const redirectUri = str('redirect_uri');
      const codeVerifier = str('code_verifier');
      if (!code || !clientId || !redirectUri || !codeVerifier) {
        throw new BadRequestException('invalid_request');
      }
      return this.oauthService.exchangeCode({
        code,
        clientId,
        redirectUri,
        codeVerifier,
      });
    }

    if (grantType === 'refresh_token') {
      const refreshToken = str('refresh_token');
      const clientId = str('client_id');
      if (!refreshToken || !clientId) {
        throw new BadRequestException('invalid_request');
      }
      return this.oauthService.refresh(clientId, refreshToken);
    }

    throw new BadRequestException('unsupported_grant_type');
  }

  @Public()
  @Post('revoke')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke an OAuth refresh token (RFC 7009)' })
  revoke(@Body() dto: OAuthRevokeDto): Promise<void> {
    return this.oauthService.revoke(dto.client_id ?? '', dto.token);
  }

  @UseGuards(OAuthGuard)
  @ApiBearerAuth()
  @Get('userinfo')
  @ApiOperation({ summary: 'OpenID-style userinfo for the access token' })
  userinfo(@CurrentUser() user: RequestUser) {
    return { sub: user.id, email: user.email, name: user.name };
  }
}
