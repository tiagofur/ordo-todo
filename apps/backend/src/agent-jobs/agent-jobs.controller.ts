import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
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
import { AgentJobsService } from './agent-jobs.service';
import { CreateAgentJobDto, UpdateAgentJobDto } from './dto/agent-jobs.dto';

@ApiTags('Agent Jobs')
@ApiBearerAuth()
@Controller('agent-jobs')
@UseGuards(JwtAuthGuard)
export class AgentJobsController {
  constructor(private readonly jobs: AgentJobsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a recurrent job from a natural-language schedule',
    description:
      'Example scheduleText: "cada viernes a las 5". The taskPrompt runs on every tick; weekly/daily summary prompts reuse the report generators.',
  })
  @ApiResponse({ status: 201, description: 'Job created' })
  @ApiResponse({ status: 400, description: 'Schedule not understood' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() dto: CreateAgentJobDto, @CurrentUser() user: RequestUser) {
    return this.jobs.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List my agent jobs' })
  @ApiResponse({ status: 200, description: 'Job list' })
  list(@CurrentUser() user: RequestUser) {
    return this.jobs.list(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an agent job' })
  @ApiResponse({ status: 200, description: 'Job details' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  get(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.jobs.get(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a job (pause/resume via isActive)',
    description:
      'Changing the schedule is not supported: delete and recreate the job instead.',
  })
  @ApiResponse({ status: 200, description: 'Job updated' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAgentJobDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.jobs.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an agent job' })
  @ApiResponse({ status: 204, description: 'Job deleted' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<void> {
    await this.jobs.remove(user.id, id);
  }

  @Post(':id/run')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Run a job immediately' })
  @ApiResponse({ status: 200, description: 'Run result' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  runNow(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.jobs.runNow(user.id, id);
  }
}
