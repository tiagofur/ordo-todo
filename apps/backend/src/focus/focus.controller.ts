import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/types/request-user.interface';
import { FocusAudioService } from './focus-audio.service';

@ApiTags('Focus')
@ApiBearerAuth()
@Controller('focus')
@UseGuards(JwtAuthGuard)
export class FocusController {
  constructor(private readonly focusAudioService: FocusAudioService) {}

  // ============ AMBIENT TRACKS ============

  @Get('tracks')
  @ApiOperation({
    summary: 'Get all available ambient tracks',
    description:
      'Retrieve a list of all available ambient tracks. Can filter by category.',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    enum: ['nature', 'cafe', 'music', 'white-noise', 'binaural'],
    description:
      'Filter tracks by category (nature, cafe, music, white-noise, binaural)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of ambient tracks retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  getTracks(@Query('category') category?: string) {
    if (category) {
      return this.focusAudioService.getTracksByCategory(
        category as 'nature' | 'cafe' | 'music' | 'white-noise' | 'binaural',
      );
    }
    return this.focusAudioService.getAvailableTracks();
  }

  @Get('tracks/:id')
  @ApiOperation({
    summary: 'Get a specific track by ID',
    description:
      'Retrieve detailed information about a specific ambient track by its ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique ID of the track',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Track details retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 404,
    description: 'Track not found',
  })
  getTrack(@Param('id') id: string) {
    return this.focusAudioService.getTrack(id);
  }

  @Get('tracks/recommended')
  @ApiOperation({
    summary: 'Get recommended tracks based on time of day',
    description:
      'Retrieve personalized track recommendations based on the current time of day and user preferences.',
  })
  @ApiResponse({
    status: 200,
    description: 'Recommended tracks retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  getRecommendedTracks(@CurrentUser() user: RequestUser) {
    return this.focusAudioService.getRecommendedTracks(user.id);
  }

  // ============ FOCUS MODES ============

  @Get('modes')
  @ApiOperation({
    summary: 'Get all available focus modes',
    description:
      'Retrieve a list of all available focus modes (e.g., Deep Work, Light Focus, Creative Flow).',
  })
  @ApiResponse({
    status: 200,
    description: 'List of focus modes retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  getModes() {
    return this.focusAudioService.getAvailableModes();
  }

  @Get('modes/:id')
  @ApiOperation({
    summary: 'Get a specific focus mode',
    description:
      'Retrieve detailed information about a specific focus mode by its ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique ID of the focus mode',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Focus mode details retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 404,
    description: 'Focus mode not found',
  })
  getMode(@Param('id') id: string) {
    return this.focusAudioService.getMode(id);
  }

  // ============ USER PREFERENCES ============

  @Get('favorites')
  @ApiOperation({
    summary: "Get user's favorite tracks",
    description:
      'Retrieve the list of tracks marked as favorites by the authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Favorite tracks retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  getFavorites(@CurrentUser() user: RequestUser) {
    return this.focusAudioService.getUserFavorites(user.id);
  }

  @Post('favorites/:trackId')
  @ApiOperation({
    summary: 'Toggle a track as favorite',
    description:
      "Add or remove a track from the user's favorites list. If the track is already favorited, it will be removed. Otherwise, it will be added.",
  })
  @ApiParam({
    name: 'trackId',
    description: 'The ID of the track to toggle',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Track favorite status toggled successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 404,
    description: 'Track not found',
  })
  toggleFavorite(
    @Param('trackId') trackId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.focusAudioService.toggleFavorite(user.id, trackId);
  }

  @Get('preferences')
  @ApiOperation({
    summary: "Get user's audio preferences",
    description:
      "Retrieve the authenticated user's audio preferences including volume, transitions, and preferred focus mode.",
  })
  @ApiResponse({
    status: 200,
    description: 'Audio preferences retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  getPreferences(@CurrentUser() user: RequestUser) {
    return this.focusAudioService.getUserPreferences(user.id);
  }

  @Patch('preferences')
  @ApiOperation({
    summary: "Update user's audio preferences",
    description:
      "Update the authenticated user's audio preferences. All fields are optional.",
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        defaultVolume: {
          type: 'number',
          minimum: 0,
          maximum: 100,
          description: 'Default volume level (0-100)',
        },
        enableTransitions: {
          type: 'boolean',
          description: 'Enable smooth transitions between tracks',
        },
        preferredModeId: {
          type: 'string',
          nullable: true,
          description: 'ID of the preferred focus mode, or null to clear',
        },
      },
      examples: {
        updateAll: {
          summary: 'Update all preferences',
          value: {
            defaultVolume: 75,
            enableTransitions: true,
            preferredModeId: 'mode-deep-work',
          },
        },
        updateVolume: {
          summary: 'Update only volume',
          value: {
            defaultVolume: 50,
          },
        },
        clearMode: {
          summary: 'Clear preferred mode',
          value: {
            preferredModeId: null,
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Audio preferences updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request body',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  updatePreferences(
    @CurrentUser() user: RequestUser,
    @Body()
    body: {
      defaultVolume?: number;
      enableTransitions?: boolean;
      preferredModeId?: string | null;
    },
  ) {
    return this.focusAudioService.saveUserPreferences(user.id, body);
  }

  // ============ STATISTICS ============

  @Get('stats')
  @ApiOperation({
    summary: 'Get focus session statistics',
    description:
      "Retrieve analytics and statistics about the user's focus sessions, including total time, tracks played, and usage patterns.",
  })
  @ApiResponse({
    status: 200,
    description: 'Focus statistics retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  getStats(@CurrentUser() user: RequestUser) {
    return this.focusAudioService.getFocusStats(user.id);
  }

  @Post('track-usage')
  @ApiOperation({
    summary: 'Record track usage for analytics',
    description:
      'Log track usage data for analytics. This endpoint should be called when a user stops playing a track or at regular intervals during playback.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['trackId', 'durationMinutes'],
      properties: {
        trackId: {
          type: 'string',
          description: 'The ID of the track being used',
        },
        durationMinutes: {
          type: 'number',
          minimum: 0,
          description: 'Duration of track usage in minutes',
        },
      },
    },
    examples: {
      shortUsage: {
        summary: 'Short usage (5 minutes)',
        value: {
          trackId: 'track-rain-sounds',
          durationMinutes: 5,
        },
      },
      longUsage: {
        summary: 'Long usage (45 minutes)',
        value: {
          trackId: 'track-lofi-beats',
          durationMinutes: 45,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Track usage recorded successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request body',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token required',
  })
  @ApiResponse({
    status: 404,
    description: 'Track not found',
  })
  recordTrackUsage(
    @CurrentUser() user: RequestUser,
    @Body() body: { trackId: string; durationMinutes: number },
  ) {
    return this.focusAudioService.recordTrackUsage(
      user.id,
      body.trackId,
      body.durationMinutes,
    );
  }
}
