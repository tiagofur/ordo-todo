import type { ReactNode } from 'react';
import type { StyleableProps } from './button';

// ============ CREATOR OS: IDEAS ============

/**
 * Idea card props
 */
export interface IdeaCardProps extends StyleableProps {
    /** Idea data */
    idea: {
        id: string;
        title: string;
        description?: string;
        source: 'MANUAL' | 'VOICE' | 'WHATSAPP' | 'TELEGRAM' | 'EMAIL' | 'BROWSER' | 'IMPORT';
        status: 'ACTIVE' | 'PROMOTED' | 'ARCHIVED' | 'GRAVEYARDED';
        tags?: Array<{ id: string; name: string; color: string }>;
        createdAt: Date;
    };
    /** Click handler */
    onClick?: () => void;
    onPress?: () => void;
    /** Promote to content handler */
    onPromote?: () => void;
    /** Archive handler */
    onArchive?: () => void;
    /** Edit handler */
    onEdit?: () => void;
    /** Selected state */
    selected?: boolean;
    /** Compact mode */
    compact?: boolean;
}

// ============ CREATOR OS: CONTENT PIPELINE ============

/**
 * Content piece card props
 */
export interface ContentCardProps extends StyleableProps {
    /** Content piece data */
    content: {
        id: string;
        title: string;
        description?: string;
        status: 'SCRIPTING' | 'FILMING' | 'EDITING' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
        contentType: string;
        thumbnailUrl?: string;
        scheduledAt?: Date;
        publishedAt?: Date;
        series?: { id: string; name: string; color: string };
        episodeNumber?: number;
    };
    /** Click handler */
    onClick?: () => void;
    onPress?: () => void;
    /** Drag handle for Kanban */
    draggable?: boolean;
    /** Drag state */
    isDragging?: boolean;
    /** Compact mode */
    compact?: boolean;
}

/**
 * Pipeline status column props
 */
export interface PipelineColumnProps extends StyleableProps {
    /** Column status */
    status: 'SCRIPTING' | 'FILMING' | 'EDITING' | 'SCHEDULED' | 'PUBLISHED';
    /** Column title */
    title: string;
    /** Column color */
    color: string;
    /** Content cards */
    children?: ReactNode;
    /** Number of items */
    count?: number;
    /** Drop handler */
    onDrop?: (contentId: string) => void;
    /** Is drop target active */
    isDropTarget?: boolean;
}

/**
 * Content pipeline (Kanban board) props
 */
export interface ContentPipelineProps extends StyleableProps {
    /** Pipeline data by status */
    pipeline: {
        scripting: Array<ContentCardProps['content']>;
        filming: Array<ContentCardProps['content']>;
        editing: Array<ContentCardProps['content']>;
        scheduled: Array<ContentCardProps['content']>;
        published: Array<ContentCardProps['content']>;
    };
    /** Content card click handler */
    onContentClick?: (id: string) => void;
    /** Status change handler (drag & drop) */
    onStatusChange?: (id: string, newStatus: string) => void;
    /** Loading state */
    loading?: boolean;
}

// ============ CREATOR OS: SERIES ============

/**
 * Series card props
 */
export interface SeriesCardProps extends StyleableProps {
    /** Series data */
    series: {
        id: string;
        name: string;
        description?: string;
        color: string;
        coverImage?: string;
        seriesType: 'EPISODIC' | 'THEMATIC' | 'CHALLENGE' | 'EVERGREEN';
        contentCount?: number;
        isActive: boolean;
    };
    /** Click handler */
    onClick?: () => void;
    onPress?: () => void;
    /** Edit handler */
    onEdit?: () => void;
    /** Compact mode */
    compact?: boolean;
}

// ============ CREATOR OS: PUBLISHING ============

/**
 * Social post card props
 */
export interface SocialPostCardProps extends StyleableProps {
    /** Social post data */
    post: {
        id: string;
        platform: string;
        title?: string;
        description?: string;
        status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHING' | 'PUBLISHED' | 'FAILED';
        scheduledAt?: Date;
        publishedAt?: Date;
        platformUrl?: string;
        views?: number;
        likes?: number;
        comments?: number;
        shares?: number;
        errorMessage?: string;
    };
    /** Click handler */
    onClick?: () => void;
    onPress?: () => void;
    /** Edit handler */
    onEdit?: () => void;
    /** Reschedule handler */
    onReschedule?: () => void;
}

/**
 * Platform selector props
 */
export interface PlatformSelectorProps extends StyleableProps {
    /** Available platforms */
    platforms: Array<{
        id: string;
        name: string;
        icon: string;
        enabled: boolean;
    }>;
    /** Selected platforms */
    selected: string[];
    /** Selection change handler */
    onChange: (selected: string[]) => void;
    /** Multi-select mode */
    multiple?: boolean;
}

/**
 * Publishing calendar props
 */
export interface PublishingCalendarProps extends StyleableProps {
    /** Calendar events (scheduled posts) */
    events: Array<{
        id: string;
        date: Date;
        platform: string;
        title: string;
        status: string;
    }>;
    /** Selected date */
    selectedDate?: Date;
    /** Date selection handler */
    onDateSelect?: (date: Date) => void;
    /** Event click handler */
    onEventClick?: (id: string) => void;
    /** View mode */
    view?: 'month' | 'week' | 'day';
    /** View change handler */
    onViewChange?: (view: 'month' | 'week' | 'day') => void;
}

// ============ CREATOR OS: CONSISTENCY ============

/**
 * Consistency score props
 */
export interface ConsistencyScoreProps extends StyleableProps {
    /** Current score (0-100) */
    score: number;
    /** Current streak (weeks) */
    currentStreak: number;
    /** Longest streak */
    longestStreak: number;
    /** Published this week */
    publishedThisWeek: number;
    /** Target for this week */
    targetThisWeek: number;
    /** Compact mode */
    compact?: boolean;
}

/**
 * Streak badge props
 */
export interface StreakBadgeProps extends StyleableProps {
    /** Streak count */
    streak: number;
    /** Badge size */
    size?: 'sm' | 'md' | 'lg';
    /** Show flame animation */
    animated?: boolean;
}

/**
 * Goal progress props
 */
export interface GoalProgressProps extends StyleableProps {
    /** Current progress */
    current: number;
    /** Target */
    target: number;
    /** Label */
    label?: string;
    /** Period */
    period?: 'daily' | 'weekly' | 'monthly';
    /** Show percentage */
    showPercentage?: boolean;
}
