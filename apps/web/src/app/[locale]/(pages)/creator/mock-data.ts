
import type {
    IdeaCardProps,
    ContentCardProps,
    SeriesCardProps,
    SocialPostCardProps
} from '@ordo-todo/ui-shared';

export const MOCK_IDEAS: IdeaCardProps['idea'][] = [
    {
        id: '1',
        title: 'My Awesome Video Idea',
        description: 'A video about how to use the new Creator OS updates.',
        source: 'MANUAL',
        status: 'ACTIVE',
        tags: [{ id: '1', name: 'Tutorial', color: 'blue' }],
        createdAt: new Date(),
    },
    {
        id: '2',
        title: 'Voice Note: React Native Tips',
        description: 'Talk about performance optimization in lists.',
        source: 'VOICE',
        status: 'ACTIVE',
        createdAt: new Date(Date.now() - 86400000),
    },
    {
        id: '3',
        title: 'Imported from browser',
        description: 'Link: https://example.com/inspiration',
        source: 'BROWSER',
        status: 'PROMOTED',
        createdAt: new Date(Date.now() - 172800000),
    }
];

export const MOCK_CONTENT: ContentCardProps['content'][] = [
    {
        id: '1',
        title: 'Creator OS Workflow: Full Guide',
        status: 'SCRIPTING',
        contentType: 'VIDEO',
        thumbnailUrl: undefined,
        scheduledAt: new Date(Date.now() + 86400000), // Tomorrow
    },
    {
        id: '2',
        title: 'Vlog: Day in the Life',
        status: 'FILMING',
        contentType: 'video',
        thumbnailUrl: 'https://placehold.co/600x400',
    }
];

export const MOCK_PIPELINE = {
    scripting: [MOCK_CONTENT[0]],
    filming: [MOCK_CONTENT[1]],
    editing: [],
    scheduled: [],
    published: [],
};

export const MOCK_SERIES: SeriesCardProps['series'][] = [
    {
        id: '1',
        name: 'Ordo Logic Tutorials',
        description: 'Deep dives into the logic behind the app.',
        color: '#7C3AED',
        seriesType: 'EPISODIC',
        contentCount: 5,
        isActive: true,
    },
    {
        id: '2',
        name: 'Vlogs 2024',
        description: 'Daily life and work updates.',
        color: '#F59E0B',
        seriesType: 'THEMATIC',
        contentCount: 12,
        isActive: true,
    }
];

export const MOCK_POSTS: SocialPostCardProps['post'][] = [
    {
        id: '1',
        platform: 'YOUTUBE',
        title: 'How to organize your chaos',
        status: 'PUBLISHED',
        views: 1250,
        likes: 120,
        comments: 45,
        shares: 12,
        platformUrl: 'https://youtube.com',
    },
    {
        id: '2',
        platform: 'INSTAGRAM',
        title: 'Behind the scenes reel',
        status: 'SCHEDULED',
        scheduledAt: new Date(Date.now() + 3600000),
    },
    {
        id: '3',
        platform: 'TWITTER',
        title: 'Thread on productivity',
        status: 'DRAFT',
    }
];
