import { prisma } from '../src/index';

async function main() {
    console.log('🚀 Seeding marketing data...');

    // Seed Roadmap Items
    const roadmapItems = await prisma.roadmapItem.createMany({
        data: [
            {
                title: 'AI-Powered Task Prioritization',
                description: 'Let AI analyze your tasks and suggest the best order to tackle them based on deadlines, importance, and your work patterns.',
                status: 'IN_PROGRESS',
                totalVotes: 42,
            },
            {
                title: 'Mobile Offline Mode',
                description: 'Work on your tasks even without internet connection. All changes will sync automatically when you\'re back online.',
                status: 'PLANNED',
                totalVotes: 38,
            },
            {
                title: 'Calendar Integration',
                description: 'Two-way sync with Google Calendar, Outlook, and Apple Calendar. See your tasks alongside your meetings.',
                status: 'PLANNED',
                totalVotes: 35,
            },
            {
                title: 'Team Collaboration Features',
                description: 'Share workspaces, assign tasks to team members, and track progress together in real-time.',
                status: 'IN_PROGRESS',
                totalVotes: 31,
            },
            {
                title: 'Custom Themes & Appearance',
                description: 'Create your own color schemes and themes. Personalize the look and feel of your workspace.',
                status: 'CONSIDERING',
                totalVotes: 28,
            },
            {
                title: 'Recurring Task Templates',
                description: 'Set up templates for tasks that repeat daily, weekly, or monthly. Spend less time on repetitive setup.',
                status: 'COMPLETED',
                totalVotes: 45,
            },
            {
                title: 'Voice Input for Tasks',
                description: 'Add tasks using voice commands. Perfect for when you\'re on the go or have your hands full.',
                status: 'CONSIDERING',
                totalVotes: 22,
            },
            {
                title: 'Zapier & Make Integration',
                description: 'Connect Ordo Todo with thousands of other apps through Zapier and Make (formerly Integromat).',
                status: 'PLANNED',
                totalVotes: 19,
            },
        ],
        skipDuplicates: true,
    });

    console.log(`✅ Created ${roadmapItems.count} roadmap items`);

    // Seed Changelog Entries
    const changelogEntries = await prisma.changelogEntry.createMany({
        data: [
            {
                version: '2.1.0',
                title: 'AI Assistant Improvements',
                content: 'Enhanced AI suggestions with context-aware task recommendations. The AI now learns from your habits to suggest better scheduling.',
                type: 'NEW',
                publishedAt: new Date('2024-12-28'),
            },
            {
                version: '2.0.5',
                title: 'Performance Optimizations',
                content: 'Reduced app load time by 40%. Fixed memory leaks in the timer component. Improved database query efficiency.',
                type: 'IMPROVED',
                publishedAt: new Date('2024-12-20'),
            },
            {
                version: '2.0.4',
                title: 'Bug Fixes',
                content: 'Fixed issue where tasks would disappear after sync. Resolved calendar view rendering issues on Safari.',
                type: 'FIXED',
                publishedAt: new Date('2024-12-15'),
            },
            {
                version: '2.0.0',
                title: 'Ordo Todo 2.0 Launch',
                content: 'Complete redesign with new UI, AI assistant, habit tracking, and much more. This is our biggest update ever!',
                type: 'NEW',
                publishedAt: new Date('2024-12-01'),
            },
        ],
        skipDuplicates: true,
    });

    console.log(`✅ Created ${changelogEntries.count} changelog entries`);

    // Seed FAQs
    const faqs = await prisma.fAQ.createMany({
        data: [
            {
                question: 'What is Ordo Todo?',
                answer: 'Ordo Todo is a productivity platform powered by AI that helps you organize tasks, manage projects, and optimize your workflow. It includes features like Pomodoro timers, habit tracking, and AI-powered scheduling.',
                category: 'General',
                order: 1,
            },
            {
                question: 'Is there a free plan?',
                answer: 'Yes! Ordo Todo offers a generous free plan that includes unlimited tasks, basic projects, and access to the Pomodoro timer. Premium features like AI assistance and team collaboration require a paid subscription.',
                category: 'Billing',
                order: 1,
            },
            {
                question: 'How does the AI assistant work?',
                answer: 'Our AI assistant analyzes your tasks, deadlines, and work patterns to suggest optimal scheduling. It can help prioritize your work, estimate task durations, and even draft subtasks for complex projects.',
                category: 'Features',
                order: 1,
            },
            {
                question: 'Can I use Ordo Todo offline?',
                answer: 'The mobile app supports offline mode (coming soon). Any changes you make offline will automatically sync when you reconnect to the internet.',
                category: 'Features',
                order: 2,
            },
            {
                question: 'Is my data secure?',
                answer: 'Absolutely. We use bank-level encryption (AES-256) for all data at rest and in transit. Your data is stored in secure data centers with regular backups. We never share your personal information with third parties.',
                category: 'Privacy & Security',
                order: 1,
            },
            {
                question: 'How do I cancel my subscription?',
                answer: 'You can cancel your subscription at any time from your account settings. After cancellation, you\'ll continue to have access to premium features until the end of your billing period.',
                category: 'Billing',
                order: 2,
            },
        ],
        skipDuplicates: true,
    });

    console.log(`✅ Created ${faqs.count} FAQs`);

    // Seed Blog Posts
    const blogPosts = await prisma.blogPost.createMany({
        data: [
            {
                slug: 'getting-started-with-ordo-todo',
                title: 'Getting Started with Ordo Todo',
                excerpt: 'A comprehensive guide to setting up your account and making the most of Ordo Todo.',
                content: `# Getting Started with Ordo Todo

Welcome to Ordo Todo! This guide will walk you through setting up your account and getting the most out of your productivity journey.

## Creating Your First Workspace

A workspace is where all your tasks, projects, and goals live. You can create multiple workspaces for different areas of your life...

## Adding Your First Tasks

Click the "+" button or press "N" to quickly add a new task. You can set priorities, due dates, and tags...

## Using the Pomodoro Timer

The built-in Pomodoro timer helps you focus. Click on any task and start a timer to track your work sessions...`,
                published: true,
                publishedAt: new Date('2024-12-28'),
                author: 'Ordo Team',
                category: 'Guide',
                tags: ['getting-started', 'tutorial', 'productivity'],
                readTime: 5,
            },
            {
                slug: '5-productivity-hacks-for-2025',
                title: '5 Productivity Hacks for 2025',
                excerpt: 'Start the new year right with these proven productivity strategies.',
                content: `# 5 Productivity Hacks for 2025

The new year is the perfect time to level up your productivity game. Here are five strategies that actually work...

## 1. Time Blocking

Instead of a to-do list, schedule specific blocks of time for different types of work...

## 2. The Two-Minute Rule

If a task takes less than two minutes, do it immediately...

## 3. Energy Management

Schedule your most important work during your peak energy hours...`,
                published: true,
                publishedAt: new Date('2024-12-25'),
                author: 'Ordo Team',
                category: 'Tips',
                tags: ['productivity', 'tips', '2025'],
                readTime: 4,
            },
        ],
        skipDuplicates: true,
    });

    console.log(`✅ Created ${blogPosts.count} blog posts`);

    console.log('🎉 Seeding completed!');
}

main()
    .catch((e) => {
        console.error('Error seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
