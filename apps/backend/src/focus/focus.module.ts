import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { RepositoriesModule } from '../repositories/repositories.module';
import { FocusController } from './focus.controller';
import { FocusAudioService } from './focus-audio.service';
import {
  FocusRepository,
  GetUserPreferencesUseCase,
  UpdateUserPreferencesUseCase,
  ToggleFavoriteTrackUseCase,
  GetFocusStatsUseCase,
  RecordTrackUsageUseCase,
  GetRecommendedTracksUseCase,
} from '@ordo-todo/core';

@Module({
  imports: [DatabaseModule, RepositoriesModule],
  controllers: [FocusController],
  providers: [
    {
      provide: GetUserPreferencesUseCase,
      useFactory: (focusRepo: FocusRepository) =>
        new GetUserPreferencesUseCase(focusRepo),
      inject: ['FocusRepository'],
    },
    {
      provide: UpdateUserPreferencesUseCase,
      useFactory: (focusRepo: FocusRepository) =>
        new UpdateUserPreferencesUseCase(focusRepo),
      inject: ['FocusRepository'],
    },
    {
      provide: ToggleFavoriteTrackUseCase,
      useFactory: (focusRepo: FocusRepository) =>
        new ToggleFavoriteTrackUseCase(focusRepo),
      inject: ['FocusRepository'],
    },
    {
      provide: GetFocusStatsUseCase,
      useFactory: (focusRepo: FocusRepository) =>
        new GetFocusStatsUseCase(focusRepo),
      inject: ['FocusRepository'],
    },
    {
      provide: RecordTrackUsageUseCase,
      useFactory: (focusRepo: FocusRepository) =>
        new RecordTrackUsageUseCase(focusRepo),
      inject: ['FocusRepository'],
    },
    {
      provide: GetRecommendedTracksUseCase,
      useFactory: (focusRepo: FocusRepository) =>
        new GetRecommendedTracksUseCase(focusRepo),
      inject: ['FocusRepository'],
    },
    FocusAudioService,
  ],
  exports: [FocusAudioService],
})
export class FocusModule { }
