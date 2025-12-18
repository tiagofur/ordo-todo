const { PrismaClient, Theme, Priority, WorkspaceType, TaskStatus } = require('@prisma/client');

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
                    theme: 'AUTO',
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
                type: 'PERSONAL',
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

    // Create sample tasks
    const tasksCount = await prisma.task.count({
        where: { projectId: project.id },
    });

    if (tasksCount === 0) {
        await Promise.all([
            prisma.task.create({
                data: {
                    title: "Welcome to Ordo-Todo! 👋",
                    description: "This is your first task.",
                    priority: 'MEDIUM',
                    estimatedMinutes: 25,
                    position: 0,
                    creatorId: user.id,
                    projectId: project.id,
                },
            }),
            prisma.task.create({
                data: {
                    title: "Try the Pomodoro Timer 🍅",
                    description: "Use the timer to stay focused.",
                    priority: 'HIGH',
                    estimatedMinutes: 50,
                    position: 1,
                    creatorId: user.id,
                    projectId: project.id,
                },
            }),
        ]);
        console.log(`✅ Created sample tasks`);
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
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
