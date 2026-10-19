import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/types/request-user.interface';
import { ApiTokensService } from './api-tokens.service';
import { CreateApiTokenDto } from './dto/create-api-token.dto';
import {
  ApiTokenResponseDto,
  CreatedApiTokenResponseDto,
} from './dto/api-token-response.dto';

@ApiTags('API Tokens')
@ApiBearerAuth()
@Controller('api-tokens')
@UseGuards(JwtAuthGuard)
export class ApiTokensController {
  constructor(private readonly apiTokensService: ApiTokensService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a personal access token' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Token created. The secret is returned only once.',
    type: CreatedApiTokenResponseDto,
  })
  create(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateApiTokenDto,
  ): Promise<CreatedApiTokenResponseDto> {
    return this.apiTokensService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List my personal access tokens' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tokens without secrets or hashes.',
    type: [ApiTokenResponseDto],
  })
  list(@CurrentUser() user: RequestUser) {
    return this.apiTokensService.list(user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke a personal access token' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Token revoked.',
  })
  revoke(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
  ): Promise<void> {
    return this.apiTokensService.revoke(user.id, id);
  }
}
