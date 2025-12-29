import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/types/request-user.interface';
import {
  SemanticSearchService,
  SearchOptions,
} from './semantic-search.service';

@ApiTags('Search')
@ApiBearerAuth()
@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SemanticSearchService) {}

  /**
   * Perform a semantic search across all user content
   * @param q - The search query in natural language
   * @param types - Optional comma-separated list of types to search (task,project,habit)
   * @param projectId - Optional project filter
   * @param includeCompleted - Include completed items (default: false)
   * @param limit - Max results (default: 20)
   */
  @Get()
  @ApiOperation({
    summary: 'Semantic search across user content',
    description:
      'Performs AI-powered semantic search across tasks, projects, and habits. Understands natural language queries and returns relevant results ranked by semantic similarity.',
  })
  @ApiQuery({
    name: 'q',
    description: 'Search query in natural language (required)',
    required: true,
    example: 'tasks related to documentation',
  })
  @ApiQuery({
    name: 'types',
    description:
      'Comma-separated list of content types to search (task,project,habit)',
    required: false,
    example: 'task,project',
  })
  @ApiQuery({
    name: 'projectId',
    description: 'Filter results by project ID',
    required: false,
    example: 'project123',
  })
  @ApiQuery({
    name: 'includeCompleted',
    description: 'Include completed items in results (default: false)',
    required: false,
    example: 'false',
  })
  @ApiQuery({
    name: 'limit',
    description: 'Maximum number of results to return (default: 20)',
    required: false,
    example: '20',
  })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
    schema: {
      example: {
        results: [
          {
            id: 'task123',
            type: 'task',
            title: 'Write API documentation',
            score: 0.95,
            metadata: {
              projectName: 'Backend API',
              status: 'IN_PROGRESS',
              priority: 'HIGH',
            },
          },
          {
            id: 'task456',
            type: 'task',
            title: 'Document user authentication flow',
            score: 0.87,
            metadata: {
              projectName: 'Frontend',
              status: 'TODO',
              priority: 'MEDIUM',
            },
          },
        ],
        interpretation: 'User is looking for documentation-related tasks',
        totalCount: 2,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Query parameter is required' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async search(
    @Query('q') query: string,
    @Query('types') types?: string,
    @Query('projectId') projectId?: string,
    @Query('includeCompleted') includeCompleted?: string,
    @Query('limit') limit?: string,
    @CurrentUser() user?: RequestUser,
  ) {
    if (!query || query.trim().length === 0) {
      return {
        results: [],
        interpretation: null,
        totalCount: 0,
        error: 'Query is required',
      };
    }

    const options: SearchOptions = {
      limit: limit ? parseInt(limit, 10) : 20,
      includeCompleted: includeCompleted === 'true',
      projectId,
    };

    if (types) {
      options.types = types.split(',') as Array<'task' | 'project' | 'habit'>;
    }

    return this.searchService.search(user!.id, query, options);
  }

  /**
   * Get search suggestions based on partial input
   */
  @Get('suggestions')
  @ApiOperation({
    summary: 'Get search suggestions',
    description:
      'Returns autocomplete suggestions based on partial input. Helps users find relevant queries and content quickly.',
  })
  @ApiQuery({
    name: 'q',
    description: 'Partial query text (minimum 2 characters)',
    required: true,
    example: 'doc',
  })
  @ApiResponse({
    status: 200,
    description: 'Suggestions retrieved successfully',
    schema: {
      example: {
        suggestions: [
          {
            text: 'documentation tasks',
            type: 'query',
            count: 12,
          },
          {
            text: 'write documentation',
            type: 'task',
            count: 5,
          },
          {
            text: 'update API docs',
            type: 'task',
            count: 3,
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Query must be at least 2 characters',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSuggestions(
    @Query('q') partialQuery: string,
    @CurrentUser() user: RequestUser,
  ) {
    if (!partialQuery || partialQuery.length < 2) {
      return { suggestions: [] };
    }

    const suggestions = await this.searchService.getSuggestions(
      user.id,
      partialQuery,
    );
    return { suggestions };
  }

  /**
   * Ask a natural language question about your data
   * Examples:
   * - "¿Cuántas tareas tengo pendientes?"
   * - "¿Qué tareas vencen esta semana?"
   * - "¿Cómo va mi productividad?"
   */
  @Get('ask')
  @ApiOperation({
    summary: 'Ask natural language questions about your data',
    description:
      'Lets you ask questions in natural language about your tasks, projects, and productivity. The AI interprets your question and provides an answer with relevant data. Supports English and Spanish.',
  })
  @ApiQuery({
    name: 'q',
    description: 'Natural language question',
    required: true,
    example: 'How many tasks do I have pending?',
  })
  @ApiResponse({
    status: 200,
    description: 'Answer provided successfully',
    schema: {
      example: {
        answer:
          'You have 12 pending tasks. 3 are high priority, 5 are due this week.',
        type: 'summary',
        data: {
          totalCount: 12,
          highPriority: 3,
          dueThisWeek: 5,
          breakdown: {
            todo: 8,
            inProgress: 4,
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Question is required' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async ask(@Query('q') question: string, @CurrentUser() user: RequestUser) {
    if (!question || question.trim().length === 0) {
      return {
        answer: 'Por favor, haz una pregunta',
        type: 'error',
      };
    }

    return this.searchService.ask(user.id, question);
  }

  /**
   * Quick search - simplified search for autocomplete/quick access
   */
  @Get('quick')
  @ApiOperation({
    summary: 'Quick search for autocomplete',
    description:
      'Returns simplified search results optimized for autocomplete and quick access. Limited to 5 results and only includes tasks and projects.',
  })
  @ApiQuery({
    name: 'q',
    description: 'Search query (minimum 2 characters)',
    required: true,
    example: 'backend',
  })
  @ApiResponse({
    status: 200,
    description: 'Quick search results retrieved successfully',
    schema: {
      example: {
        results: [
          {
            id: 'task123',
            type: 'task',
            title: 'Backend API integration',
            subtitle: 'IN_PROGRESS',
          },
          {
            id: 'project456',
            type: 'project',
            title: 'Backend Refactoring',
            subtitle: 'ACTIVE',
          },
          {
            id: 'task789',
            type: 'task',
            title: 'Fix backend performance issue',
            subtitle: 'TODO',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Query must be at least 2 characters',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async quickSearch(
    @Query('q') query: string,
    @CurrentUser() user: RequestUser,
  ) {
    if (!query || query.length < 2) {
      return { results: [] };
    }

    const result = await this.searchService.search(user.id, query, {
      limit: 5,
      types: ['task', 'project'],
    });

    // Return simplified results
    return {
      results: result.results.map((r) => ({
        id: r.id,
        type: r.type,
        title: r.title,
        subtitle: r.metadata.projectName || r.metadata.status,
      })),
    };
  }
}
