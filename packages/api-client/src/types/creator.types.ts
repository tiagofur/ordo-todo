/**
 * Creator OS Types
 *
 * Types for Ideas, Content Pieces, and Series management
 */

/**
 * Idea Source - Where the idea came from
 */
export type IdeaSource = 'MANUAL' | 'VOICE' | 'WHATSAPP' | 'TELEGRAM' | 'EMAIL' | 'BROWSER' | 'IMPORT';

/**
 * Idea Status - Lifecycle state
 */
export type IdeaStatus = 'ACTIVE' | 'PROMOTED' | 'ARCHIVED' | 'GRAVEYARDED';

/**
 * Content Pipeline Status - Workflow stage
 */
export type ContentPipelineStatus = 'SCRIPTING' | 'FILMING' | 'EDITING' | 'SCHEDULED' | 'PUBLISHED';

/**
 * Content Type - Format of content
 */
export type ContentType = 'VIDEO' | 'PODCAST' | 'BLOG' | 'SOCIAL' | 'THREAD' | 'EMAIL' | 'OTHER';

/**
 * Idea entity
 */
export interface Idea {
  id: string;
  title: string;
  description?: string;
  source: IdeaSource;
  voiceNoteUrl?: string;
  screenshot?: string;
  sourceUrl?: string;
  status: IdeaStatus;
  archivedAt?: Date;
  promotedAt?: Date;
  contentPieceId?: string;
  userId: string;
  workspaceId: string;
  tags?: IdeaTag[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Idea Tag
 */
export interface IdeaTag {
  id: string;
  name: string;
  color: string;
}

/**
 * Create Idea DTO
 */
export interface CreateIdeaDto {
  title: string;
  description?: string;
  source?: IdeaSource;
  voiceNoteUrl?: string;
  screenshot?: string;
  sourceUrl?: string;
}

/**
 * Update Idea DTO
 */
export interface UpdateIdeaDto {
  title?: string;
  description?: string;
}

/**
 * Ideas List Response (paginated)
 */
export interface IdeasListResponse {
  data: Idea[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Content Piece entity
 */
export interface ContentPiece {
  id: string;
  title: string;
  description?: string;
  status: ContentPipelineStatus;
  statusChangedAt: Date;
  contentType: ContentType;
  script?: string;
  notes?: string;
  scheduledAt?: Date;
  publishedAt?: Date;
  thumbnailUrl?: string;
  ideaId?: string;
  seriesId?: string;
  episodeNumber?: number;
  userId: string;
  workspaceId: string;
  socialPosts?: SocialPost[];
  series?: SeriesBasic;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Social Post (for publishing)
 */
/**
 * Content Platform - Where content is published
 */
export type ContentPlatform = 'YOUTUBE' | 'INSTAGRAM' | 'TIKTOK' | 'TWITTER' | 'LINKEDIN' | 'FACEBOOK' | 'THREADS';

/**
 * Post Status - Lifecycle state of a social post
 */
export type PostStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED';

/**
 * Social Post (for publishing)
 */
export interface SocialPost {
  id: string;
  platform: ContentPlatform;
  status: PostStatus;
  content?: string;
  mediaUrls?: string[];
  scheduledAt?: string;
  publishedAt?: string;
  platformUrl?: string;
  errorMessage?: string;
  contentPieceId?: string;
  userId: string;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create Social Post DTO
 */
export interface CreateSocialPostDto {
  platform: ContentPlatform;
  contentPieceId?: string;
  content?: string;
  mediaUrls?: string[];
  scheduledAt?: string;
}

/**
 * Update Social Post DTO
 */
export interface UpdateSocialPostDto {
  content?: string;
  mediaUrls?: string[];
  scheduledAt?: string;
}

/**
 * Schedule Post DTO
 */
export interface SchedulePostDto {
  scheduledAt: string;
}

/**
 * Bulk Schedule DTO
 */
export interface BulkScheduleDto {
  contentPieceId: string;
  posts: CreateSocialPostDto[];
}

/**
 * Social Post Response (paginated)
 */
export interface SocialPostsListResponse {
  data: SocialPost[];
  total: number;
}

/**
 * Series Basic Info
 */
export interface SeriesBasic {
  id: string;
  name: string;
  color: string;
}

/**
 * Create Content Piece DTO
 */
export interface CreateContentPieceDto {
  title: string;
  description?: string;
  contentType: ContentType;
  script?: string;
  notes?: string;
  ideaId?: string;
  seriesId?: string;
  episodeNumber?: number;
  thumbnailUrl?: string;
  scheduledAt?: string;
}

/**
 * Update Content Piece DTO
 */
export interface UpdateContentPieceDto {
  title?: string;
  description?: string;
  contentType?: ContentType;
  script?: string;
  notes?: string;
  seriesId?: string;
  episodeNumber?: number;
  thumbnailUrl?: string;
  scheduledAt?: string;
}

/**
 * Update Content Status DTO
 */
export interface UpdateContentStatusDto {
  status: ContentPipelineStatus;
}

/**
 * Content Pieces List Response (paginated)
 */
export interface ContentPiecesListResponse {
  data: ContentPiece[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Pipeline View Response (grouped by status)
 */
export interface PipelineViewResponse {
  scripting: ContentPiece[];
  filming: ContentPiece[];
  editing: ContentPiece[];
  scheduled: ContentPiece[];
  published: ContentPiece[];
}

/**
 * Series entity
 */
export interface Series {
  id: string;
  name: string;
  description?: string;
  color: string;
  seriesType: 'EPISODIC' | 'THEMATIC';
  contentCount: number;
  isActive: boolean;
  userId: string;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
}
