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
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/types/request-user.interface';
import { FocusAudioService } from './focus-audio.service';

@Controller('focus')
@UseGuards(JwtAuthGuard)
export class FocusController {
    constructor(private readonly focusAudioService: FocusAudioService) { }

    // ============ AMBIENT TRACKS ============

    /**
     * Get all available ambient tracks
     */
    @Get('tracks')
    getTracks(@Query('category') category?: string) {
        if (category) {
            return this.focusAudioService.getTracksByCategory(
                category as 'nature' | 'cafe' | 'music' | 'white-noise' | 'binaural',
            );
        }
        return this.focusAudioService.getAvailableTracks();
    }

    /**
     * Get a specific track by ID
     */
    @Get('tracks/:id')
    getTrack(@Param('id') id: string) {
        return this.focusAudioService.getTrack(id);
    }

    /**
     * Get recommended tracks based on time of day
     */
    @Get('tracks/recommended')
    getRecommendedTracks(@CurrentUser() user: RequestUser) {
        return this.focusAudioService.getRecommendedTracks(user.id);
    }

    // ============ FOCUS MODES ============

    /**
     * Get all available focus modes
     */
    @Get('modes')
    getModes() {
        return this.focusAudioService.getAvailableModes();
    }

    /**
     * Get a specific focus mode
     */
    @Get('modes/:id')
    getMode(@Param('id') id: string) {
        return this.focusAudioService.getMode(id);
    }

    // ============ USER PREFERENCES ============

    /**
     * Get user's favorite tracks
     */
    @Get('favorites')
    getFavorites(@CurrentUser() user: RequestUser) {
        return this.focusAudioService.getUserFavorites(user.id);
    }

    /**
     * Toggle a track as favorite
     */
    @Post('favorites/:trackId')
    toggleFavorite(
        @Param('trackId') trackId: string,
        @CurrentUser() user: RequestUser,
    ) {
        return this.focusAudioService.toggleFavorite(user.id, trackId);
    }

    /**
     * Get user's audio preferences
     */
    @Get('preferences')
    getPreferences(@CurrentUser() user: RequestUser) {
        return this.focusAudioService.getUserPreferences(user.id);
    }

    /**
     * Update user's audio preferences
     */
    @Patch('preferences')
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

    /**
     * Get focus session statistics
     */
    @Get('stats')
    getStats(@CurrentUser() user: RequestUser) {
        return this.focusAudioService.getFocusStats(user.id);
    }

    /**
     * Record track usage (for analytics)
     */
    @Post('track-usage')
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
