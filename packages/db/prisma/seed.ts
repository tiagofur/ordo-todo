import { PrismaClient, Theme, Priority, WorkspaceType, TaskStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...");

    // Create demo user
    const user = await prisma.user.upsert({
        where: { email: "demo@ordo-todo.app" },
        update: {},
        create: {
            name: "Demo User",
            email: "demo@ordo-todo.app",
            username: "demo_user",
            preferences: {
                create: {
                    theme: Theme.AUTO,
                    pomodoroDuration: 25,
                    shortBreakDuration: 5,
                    longBreakDuration: 15,
                }
            }
        },
    });

    console.log(`✅ Created user: ${user.email}`);

    // Create default workspace
    let workspace = await prisma.workspace.findFirst({
        where: {
            ownerId: user.id,
            name: "Personal",
        },
    });

    if (!workspace) {
        workspace = await prisma.workspace.create({
            data: {
                name: "Personal",
                slug: "personal",
                description: "My personal workspace",
                color: "#6366f1",
                type: WorkspaceType.PERSONAL,
                ownerId: user.id,
            },
        });
    }

    console.log(`✅ Created workspace: ${workspace.name}`);

    // Create default workflow
    let workflow = await prisma.workflow.findFirst({
        where: {
            workspaceId: workspace.id,
            name: "General",
        },
    });

    if (!workflow) {
        workflow = await prisma.workflow.create({
            data: {
                name: "General",
                description: "Default workflow",
                color: "#6B7280",
                position: 0,
                workspaceId: workspace.id,
            },
        });
    }

    console.log(`✅ Created workflow: ${workflow.name}`);

    // Create sample project
    let project = await prisma.project.findFirst({
        where: {
            workspaceId: workspace.id,
            name: "Getting Started",
        },
    });

    if (!project) {
        project = await prisma.project.create({
            data: {
                name: "Getting Started",
                slug: "getting-started",
                description: "Learn how to use Ordo-Todo",
                color: "#8b5cf6",
                workspaceId: workspace.id,
                workflowId: workflow.id,
            },
        });
    }

    console.log(`✅ Created project: ${project.name}`);

    // Create sample tags
    const tagsToCreate = [
        { name: "tutorial", color: "#22c55e" },
        { name: "important", color: "#ef4444" },
    ];

    for (const tagData of tagsToCreate) {
        const existingTag = await prisma.tag.findFirst({
            where: {
                workspaceId: workspace.id,
                name: tagData.name,
            },
        });

        if (!existingTag) {
            await prisma.tag.create({
                data: {
                    ...tagData,
                    workspaceId: workspace.id,
                },
            });
        }
    }

    console.log(`✅ Created tags`);

    // Create sample tasks
    const tasksCount = await prisma.task.count({
        where: { projectId: project.id },
    });

    if (tasksCount === 0) {
        await Promise.all([
            prisma.task.create({
                data: {
                    title: "Welcome to Ordo-Todo! 👋",
                    description: "This is your first task. Click on it to see the details.",
                    priority: Priority.MEDIUM,
                    estimatedMinutes: 25,
                    position: 0,
                    ownerId: user.id,
                    projectId: project.id,
                },
            }),
            prisma.task.create({
                data: {
                    title: "Try the Pomodoro Timer 🍅",
                    description: "Use the timer to stay focused. Press the play button to start a 25-minute work session.",
                    priority: Priority.HIGH,
                    estimatedMinutes: 50,
                    position: 1,
                    ownerId: user.id,
                    projectId: project.id,
                },
            }),
            prisma.task.create({
                data: {
                    title: "Create your first project 📁",
                    description: "Organize your tasks by creating projects. Go to the sidebar and click 'New Project'.",
                    priority: Priority.LOW,
                    estimatedMinutes: 25,
                    position: 2,
                    ownerId: user.id,
                    projectId: project.id,
                },
            }),
        ]);
        console.log(`✅ Created sample tasks`);
    } else {
        console.log(`ℹ️ Sample tasks already exist`);
    }

    // Create sample blog posts
    const blogCount = await prisma.blogPost.count();

    if (blogCount === 0) {
        await Promise.all([
            prisma.blogPost.create({
                data: {
                    slug: 'welcome-to-ordo-todo',
                    title: 'Welcome to Ordo Todo',
                    excerpt: 'Discover how Ordo Todo can transform your productivity.',
                    content: 'Ordo Todo is more than just a task manager.',
                    published: true,
                    publishedAt: new Date(),
                    author: 'Ordo Team',
                    tags: ['Productivity', 'News'],
                    coverImage: 'https://images.unsplash.com/photo-1499750310159-5b5f8ea37a85?auto=format&fit=crop&q=80',
                }
            }),
            prisma.blogPost.create({
                data: {
                    slug: 'productivity-tips',
                    title: '5 Tips to Boost Productivity',
                    excerpt: 'Learn the secrets of highly productive people.',
                    content: '1. Use a timer. 2. Prioritize tasks.',
                    published: true,
                    publishedAt: new Date(Date.now() - 86400000), // Yesterday
                    author: 'Ordo Team',
                    tags: ['Tips', 'Guide'],
                    coverImage: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80',
                }
            })
        ]);
        console.log(`✅ Created sample blog posts`);
    } else {
        console.log(`ℹ️ Sample blog posts already exist`);
    }

    console.log("🎉 Seeding completed!");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error("❌ Seeding failed:", e);
        await prisma.$disconnect();
        process.exit(1);
    });
