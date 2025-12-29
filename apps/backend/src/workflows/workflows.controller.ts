import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkflowsService } from './workflows.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';

@ApiTags('Workflows')
@ApiBearerAuth()
@Controller('workflows')
@UseGuards(JwtAuthGuard)
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  /**
   * Creates a new workflow
   * Workflows organize projects within workspaces
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new workflow',
    description:
      'Creates a new workflow within a workspace. Workflows are used to organize and categorize related projects.',
  })
  @ApiResponse({
    status: 201,
    description: 'Workflow created successfully',
    schema: {
      example: {
        id: 'clx1234567890',
        name: 'Development Cycle',
        description: 'Sprint-based development workflow',
        workspaceId: 'workspace123',
        icon: '🚀',
        color: '#3B82F6',
        order: 1,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  create(@Body() createWorkflowDto: CreateWorkflowDto) {
    return this.workflowsService.create(createWorkflowDto);
  }

  /**
   * Get all workflows
   * Can filter by workspace
   */
  @Get()
  @ApiOperation({
    summary: 'Get all workflows',
    description:
      'Returns all workflows accessible to the user. Can be filtered by workspace ID.',
  })
  @ApiQuery({
    name: 'workspaceId',
    description: 'Filter workflows by workspace ID',
    required: false,
    example: 'workspace123',
  })
  @ApiResponse({
    status: 200,
    description: 'Workflows retrieved successfully',
    schema: {
      type: 'array',
      example: [
        {
          id: 'clx1234567890',
          name: 'Development Cycle',
          description: 'Sprint-based development workflow',
          workspaceId: 'workspace123',
          icon: '🚀',
          color: '#3B82F6',
          order: 1,
          projectCount: 5,
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        },
        {
          id: 'clx1234567891',
          name: 'Marketing Campaigns',
          description: 'Marketing and promotional workflows',
          workspaceId: 'workspace123',
          icon: '📈',
          color: '#10B981',
          order: 2,
          projectCount: 3,
          createdAt: '2025-01-02T00:00:00.000Z',
          updatedAt: '2025-01-02T00:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Query('workspaceId') workspaceId: string) {
    return this.workflowsService.findAll(workspaceId);
  }

  /**
   * Update workflow details
   * Requires OWNER or ADMIN role
   */
  @Put(':id')
  @ApiOperation({
    summary: 'Update workflow',
    description:
      'Updates workflow details such as name, description, icon, color, and order.',
  })
  @ApiParam({
    name: 'id',
    description: 'Workflow ID',
    example: 'clx1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Workflow updated successfully',
    schema: {
      example: {
        id: 'clx1234567890',
        name: 'Updated Workflow Name',
        description: 'Updated description',
        workspaceId: 'workspace123',
        icon: '🔄',
        color: '#8B5CF6',
        order: 1,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-10T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Workflow not found' })
  update(
    @Param('id') id: string,
    @Body() updateWorkflowDto: UpdateWorkflowDto,
  ) {
    return this.workflowsService.update(id, updateWorkflowDto);
  }

  /**
   * Delete workflow
   * Requires OWNER or ADMIN role
   * Associated projects must be reassigned or deleted first
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete workflow',
    description:
      'Permanently deletes a workflow. All associated projects must be reassigned or deleted before workflow deletion.',
  })
  @ApiParam({
    name: 'id',
    description: 'Workflow ID',
    example: 'clx1234567890',
  })
  @ApiResponse({ status: 204, description: 'Workflow deleted successfully' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete workflow with existing projects',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Workflow not found' })
  remove(@Param('id') id: string) {
    return this.workflowsService.remove(id);
  }
}
