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
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/types/request-user.interface';
import { RegisterOAuthClientDto } from './dto/register-oauth-client.dto';
import { OAuthTokenDto } from './dto/oauth-token.dto';
import { OAuthRevokeDto } from './dto/oauth-revoke.dto';
import { OAuthAuthorizeDto } from './dto/oauth-authorize.dto';

@ApiTags('OAuth')
@Controller('oauth')
export class OAuthController {
  constructor(private readonly oauthService: OAuthService) {}

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
    summary: 'Register an OAuth client (Client ID Metadata Document)',
  })
  register(
    @Body('metadataUrl') metadataUrl: string,
    @Body() dto: RegisterOAuthClientDto,
  ) {
    return this.oauthService.registerClient(metadataUrl, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('authorize')
  @ApiOperation({
    summary: 'Authorize an OAuth client (logged-in user approves)',
  })
  async authorize(
    @CurrentUser() user: RequestUser,
    @Query() query: OAuthAuthorizeDto,
    @Res() res: Response,
  ): Promise<void> {
    const { redirectUri } = await this.oauthService.authorize({
      userId: user.id,
      clientId: query.client_id,
      redirectUri: query.redirect_uri,
      scope: query.scope,
      state: query.state,
      codeChallenge: query.code_challenge,
      codeChallengeMethod: query.code_challenge_method,
    });
    res.redirect(redirectUri);
  }

  @Public()
  @Post('token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange code or refresh token (RFC 6749)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Token response.' })
  token(@Body() dto: OAuthTokenDto) {
    if (dto.grant_type === 'authorization_code') {
      if (
        !dto.code ||
        !dto.client_id ||
        !dto.redirect_uri ||
        !dto.code_verifier
      ) {
        throw new BadRequestException('invalid_request');
      }
      return this.oauthService.exchangeCode({
        code: dto.code,
        clientId: dto.client_id,
        redirectUri: dto.redirect_uri,
        codeVerifier: dto.code_verifier,
      });
    }

    if (dto.grant_type === 'refresh_token') {
      if (!dto.refresh_token || !dto.client_id) {
        throw new BadRequestException('invalid_request');
      }
      return this.oauthService.refresh(dto.client_id, dto.refresh_token);
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
