import { CSSProperties, ReactNode, ChangeEvent } from 'react';

/**
 * Base props for all interactive components
 * Supports both web (onClick) and mobile (onPress) patterns
 */
interface InteractiveProps {
    /** Disables the component */
    disabled?: boolean;
    /** Loading state */
    loading?: boolean;
    /** Web: onClick handler */
    onClick?: () => void;
    /** Mobile: onPress handler */
    onPress?: () => void;
}
/**
 * Base props for styleable components
 */
interface StyleableProps {
    /** Web: Tailwind classes */
    className?: string;
    /** Mobile: React Native styles */
    style?: CSSProperties | object;
    /** Test ID for e2e testing */
    testID?: string;
}
/**
 * Button component props
 * Used by both @ordo-todo/ui and @ordo-todo/ui-mobile
 */
interface ButtonProps extends InteractiveProps, StyleableProps {
    /** Button text (alternative to children) */
    title?: string;
    /** Button content */
    children?: ReactNode;
    /** Visual variant */
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
    /** Size variant */
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    /** Full width button */
    fullWidth?: boolean;
    /** Icon to show before text */
    iconLeft?: ReactNode;
    /** Icon to show after text */
    iconRight?: ReactNode;
    /** Button type (web only) */
    type?: 'button' | 'submit' | 'reset';
}
/**
 * IconButton component props
 */
interface IconButtonProps extends InteractiveProps, StyleableProps {
    /** Icon component or element */
    icon: ReactNode;
    /** Accessible label */
    'aria-label': string;
    /** Visual variant */
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Rounded corners */
    rounded?: boolean;
}

/**
 * Base input props
 */
interface BaseInputProps extends StyleableProps {
    /** Input name */
    name?: string;
    /** Placeholder text */
    placeholder?: string;
    /** Disabled state */
    disabled?: boolean;
    /** Read-only state */
    readOnly?: boolean;
    /** Required field */
    required?: boolean;
    /** Error state */
    error?: boolean;
    /** Error message */
    errorMessage?: string;
    /** Helper text */
    helperText?: string;
    /** Label text */
    label?: string;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
}
/**
 * Text input props
 */
interface InputProps extends BaseInputProps {
    /** Input type */
    type?: 'text' | 'email' | 'password' | 'search' | 'url' | 'tel' | 'number';
    /** Current value */
    value?: string;
    /** Default value (uncontrolled) */
    defaultValue?: string;
    /** Web: onChange handler */
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    /** Mobile: onChangeText handler */
    onChangeText?: (text: string) => void;
    /** On blur handler */
    onBlur?: () => void;
    /** On focus handler */
    onFocus?: () => void;
    /** Icon on the left */
    iconLeft?: ReactNode;
    /** Icon on the right */
    iconRight?: ReactNode;
    /** Maximum length */
    maxLength?: number;
    /** Auto-capitalize (mobile) */
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    /** Auto-complete type */
    autoComplete?: string;
}
/**
 * Textarea props
 */
interface TextareaProps extends BaseInputProps {
    /** Current value */
    value?: string;
    /** Default value */
    defaultValue?: string;
    /** Web: onChange handler */
    onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
    /** Mobile: onChangeText handler */
    onChangeText?: (text: string) => void;
    /** Number of visible rows */
    rows?: number;
    /** Maximum length */
    maxLength?: number;
    /** Auto-resize to content */
    autoResize?: boolean;
}
/**
 * Select/Dropdown props
 */
interface SelectOption {
    label: string;
    value: string;
    disabled?: boolean;
}
interface SelectProps extends BaseInputProps {
    /** Available options */
    options: SelectOption[];
    /** Current value */
    value?: string;
    /** Default value */
    defaultValue?: string;
    /** Change handler */
    onChange?: (value: string) => void;
    /** Searchable select */
    searchable?: boolean;
    /** Multi-select */
    multiple?: boolean;
}
/**
 * Checkbox props
 */
interface CheckboxProps extends StyleableProps {
    /** Checked state */
    checked?: boolean;
    /** Default checked (uncontrolled) */
    defaultChecked?: boolean;
    /** Change handler */
    onChange?: (checked: boolean) => void;
    /** Label text */
    label?: string;
    /** Disabled state */
    disabled?: boolean;
    /** Indeterminate state */
    indeterminate?: boolean;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
}
/**
 * Switch/Toggle props
 */
interface SwitchProps extends StyleableProps {
    /** Checked state */
    checked?: boolean;
    /** Default checked */
    defaultChecked?: boolean;
    /** Change handler */
    onChange?: (checked: boolean) => void;
    /** Label text */
    label?: string;
    /** Disabled state */
    disabled?: boolean;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
}

/**
 * Card component props
 */
interface CardProps extends StyleableProps {
    /** Card content */
    children?: ReactNode;
    /** Visual variant */
    variant?: 'default' | 'outlined' | 'elevated' | 'glass';
    /** Padding size */
    padding?: 'none' | 'sm' | 'md' | 'lg';
    /** Clickable card */
    clickable?: boolean;
    /** Click/press handler */
    onClick?: () => void;
    onPress?: () => void;
    /** Selected state */
    selected?: boolean;
}
/**
 * Card header props
 */
interface CardHeaderProps extends StyleableProps {
    /** Title text */
    title: string;
    /** Subtitle text */
    subtitle?: string;
    /** Icon or avatar on the left */
    leading?: ReactNode;
    /** Action buttons on the right */
    trailing?: ReactNode;
}
/**
 * Card content props
 */
interface CardContentProps extends StyleableProps {
    children?: ReactNode;
}
/**
 * Card footer props
 */
interface CardFooterProps extends StyleableProps {
    children?: ReactNode;
    /** Align content */
    align?: 'left' | 'center' | 'right' | 'between';
}
/**
 * Box/Container props
 */
interface BoxProps extends StyleableProps {
    children?: ReactNode;
    /** Flex direction */
    direction?: 'row' | 'column';
    /** Justify content */
    justify?: 'start' | 'center' | 'end' | 'between' | 'around';
    /** Align items */
    align?: 'start' | 'center' | 'end' | 'stretch';
    /** Gap between children */
    gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    /** Padding */
    padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    /** Background color */
    bg?: 'transparent' | 'primary' | 'secondary' | 'muted' | 'card';
    /** Full width */
    fullWidth?: boolean;
    /** Full height */
    fullHeight?: boolean;
    /** Wrap content */
    wrap?: boolean;
}
/**
 * Text component props
 */
interface TextProps extends StyleableProps {
    children?: ReactNode;
    /** Typography variant */
    variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'caption' | 'label';
    /** Text color */
    color?: 'default' | 'muted' | 'primary' | 'danger' | 'success';
    /** Font weight */
    weight?: 'normal' | 'medium' | 'semibold' | 'bold';
    /** Text alignment */
    align?: 'left' | 'center' | 'right';
    /** Truncate with ellipsis */
    truncate?: boolean;
    /** Number of lines before truncating (mobile) */
    numberOfLines?: number;
}
/**
 * Badge props
 */
interface BadgeProps extends StyleableProps {
    children?: ReactNode;
    /** Visual variant */
    variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Pill shaped */
    pill?: boolean;
    /** Dot indicator (no content) */
    dot?: boolean;
}
/**
 * Avatar props
 */
interface AvatarProps extends StyleableProps {
    /** Image source URL */
    src?: string;
    /** Alt text */
    alt?: string;
    /** Fallback initials */
    fallback?: string;
    /** Size variant */
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    /** Shape */
    shape?: 'circle' | 'square';
    /** Online status indicator */
    status?: 'online' | 'offline' | 'busy' | 'away';
}
/**
 * Divider props
 */
interface DividerProps extends StyleableProps {
    /** Orientation */
    orientation?: 'horizontal' | 'vertical';
    /** With label */
    label?: string;
}
/**
 * Skeleton loader props
 */
interface SkeletonProps extends StyleableProps {
    /** Width */
    width?: string | number;
    /** Height */
    height?: string | number;
    /** Shape */
    variant?: 'text' | 'circular' | 'rectangular';
    /** Animation */
    animation?: 'pulse' | 'wave' | 'none';
}

/**
 * Dialog/Modal props
 */
interface DialogProps extends StyleableProps {
    /** Open state */
    open: boolean;
    /** Close handler */
    onOpenChange?: (open: boolean) => void;
    /** Dialog title */
    title?: string;
    /** Dialog description */
    description?: string;
    /** Dialog content */
    children?: ReactNode;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    /** Close on overlay click */
    closeOnOverlayClick?: boolean;
    /** Close on escape key */
    closeOnEscape?: boolean;
    /** Show close button */
    showCloseButton?: boolean;
}
/**
 * Sheet/Drawer props
 */
interface SheetProps extends StyleableProps {
    /** Open state */
    open: boolean;
    /** Close handler */
    onOpenChange?: (open: boolean) => void;
    /** Sheet title */
    title?: string;
    /** Sheet content */
    children?: ReactNode;
    /** Side to appear from */
    side?: 'left' | 'right' | 'top' | 'bottom';
    /** Size */
    size?: 'sm' | 'md' | 'lg' | 'full';
}
/**
 * Bottom sheet props (mobile)
 */
interface BottomSheetProps extends StyleableProps {
    /** Open state */
    open: boolean;
    /** Close handler */
    onClose?: () => void;
    /** Sheet content */
    children?: ReactNode;
    /** Snap points (percentages) */
    snapPoints?: number[];
    /** Enable background interaction */
    enableBackgroundInteraction?: boolean;
    /** Handle indicator visible */
    showHandle?: boolean;
}
/**
 * Menu/Dropdown props
 */
interface MenuProps extends StyleableProps {
    /** Trigger element */
    trigger: ReactNode;
    /** Menu items */
    children?: ReactNode;
    /** Alignment */
    align?: 'start' | 'center' | 'end';
    /** Side */
    side?: 'top' | 'right' | 'bottom' | 'left';
    /** Offset from trigger */
    offset?: number;
}
/**
 * Menu item props
 */
interface MenuItemProps extends StyleableProps {
    /** Item content */
    children?: ReactNode;
    /** Click/press handler */
    onClick?: () => void;
    onPress?: () => void;
    /** Icon */
    icon?: ReactNode;
    /** Keyboard shortcut (web) */
    shortcut?: string;
    /** Disabled state */
    disabled?: boolean;
    /** Destructive action */
    destructive?: boolean;
}
/**
 * Tooltip props
 */
interface TooltipProps extends StyleableProps {
    /** Trigger element */
    children: ReactNode;
    /** Tooltip content */
    content: ReactNode;
    /** Side */
    side?: 'top' | 'right' | 'bottom' | 'left';
    /** Delay before showing (ms) */
    delayDuration?: number;
}
/**
 * Popover props
 */
interface PopoverProps extends StyleableProps {
    /** Trigger element */
    trigger: ReactNode;
    /** Popover content */
    children?: ReactNode;
    /** Alignment */
    align?: 'start' | 'center' | 'end';
    /** Side */
    side?: 'top' | 'right' | 'bottom' | 'left';
    /** Open state (controlled) */
    open?: boolean;
    /** Open change handler */
    onOpenChange?: (open: boolean) => void;
}
/**
 * Tabs props
 */
interface TabsProps extends StyleableProps {
    /** Current tab value */
    value?: string;
    /** Default tab value */
    defaultValue?: string;
    /** Tab change handler */
    onValueChange?: (value: string) => void;
    /** Tab items */
    children?: ReactNode;
    /** Orientation */
    orientation?: 'horizontal' | 'vertical';
}
interface TabProps extends StyleableProps {
    /** Tab value */
    value: string;
    /** Tab label */
    children?: ReactNode;
    /** Disabled state */
    disabled?: boolean;
    /** Icon */
    icon?: ReactNode;
}
/**
 * Progress bar props
 */
interface ProgressProps extends StyleableProps {
    /** Progress value (0-100) */
    value: number;
    /** Maximum value */
    max?: number;
    /** Size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Color variant */
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
    /** Show percentage label */
    showLabel?: boolean;
    /** Indeterminate (loading) */
    indeterminate?: boolean;
}
/**
 * Toast/Notification props
 */
interface ToastProps extends StyleableProps {
    /** Toast title */
    title?: string;
    /** Toast description */
    description?: string;
    /** Visual variant */
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
    /** Action button */
    action?: {
        label: string;
        onClick: () => void;
    };
    /** Duration (ms), 0 for persistent */
    duration?: number;
    /** Close handler */
    onClose?: () => void;
}

/**
 * Idea card props
 */
interface IdeaCardProps extends StyleableProps {
    /** Idea data */
    idea: {
        id: string;
        title: string;
        description?: string;
        source: 'MANUAL' | 'VOICE' | 'WHATSAPP' | 'TELEGRAM' | 'EMAIL' | 'BROWSER' | 'IMPORT';
        status: 'ACTIVE' | 'PROMOTED' | 'ARCHIVED' | 'GRAVEYARDED';
        tags?: Array<{
            id: string;
            name: string;
            color: string;
        }>;
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
/**
 * Content piece card props
 */
interface ContentCardProps extends StyleableProps {
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
        series?: {
            id: string;
            name: string;
            color: string;
        };
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
interface PipelineColumnProps extends StyleableProps {
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
interface ContentPipelineProps extends StyleableProps {
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
/**
 * Series card props
 */
interface SeriesCardProps extends StyleableProps {
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
/**
 * Social post card props
 */
interface SocialPostCardProps extends StyleableProps {
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
interface PlatformSelectorProps extends StyleableProps {
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
interface PublishingCalendarProps extends StyleableProps {
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
/**
 * Consistency score props
 */
interface ConsistencyScoreProps extends StyleableProps {
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
interface StreakBadgeProps extends StyleableProps {
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
interface GoalProgressProps extends StyleableProps {
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

export type { AvatarProps, BadgeProps, BaseInputProps, BottomSheetProps, BoxProps, ButtonProps, CardContentProps, CardFooterProps, CardHeaderProps, CardProps, CheckboxProps, ConsistencyScoreProps, ContentCardProps, ContentPipelineProps, DialogProps, DividerProps, GoalProgressProps, IconButtonProps, IdeaCardProps, InputProps, InteractiveProps, MenuItemProps, MenuProps, PipelineColumnProps, PlatformSelectorProps, PopoverProps, ProgressProps, PublishingCalendarProps, SelectOption, SelectProps, SeriesCardProps, SheetProps, SkeletonProps, SocialPostCardProps, StreakBadgeProps, StyleableProps, SwitchProps, TabProps, TabsProps, TextProps, TextareaProps, ToastProps, TooltipProps };
