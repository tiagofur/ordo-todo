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
                    creatorId: user.id,
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
                    creatorId: user.id,
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
                    creatorId: user.id,
                    projectId: project.id,
                },
            }),
        ]);
        console.log(`✅ Created sample tasks`);
    } else {
        console.log(`ℹ️ Sample tasks already exist`);
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
