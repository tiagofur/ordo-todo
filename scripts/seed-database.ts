/**
 * Database Seed Script
 *
 * Populates the database with initial development/test data.
 * Includes users, workspaces, projects, tasks, tags, and sample data.
 *
 * Usage:
 *   npx tsx scripts/seed-database.ts
 */

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data (in development only!)
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (isDevelopment) {
    console.log('🧹 Cleaning existing data...');
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.workflow.deleteMany();
    await prisma.workspaceMember.deleteMany();
    await prisma.workspace.deleteMany();
    await prisma.user.deleteMany();
  }

  // Create test users
  console.log('👤 Creating test users...');
  const hashedPassword = await hash('password123', 12);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john.doe@example.com',
        name: 'John Doe',
        password: hashedPassword,
        emailVerified: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        email: 'jane.smith@example.com',
        name: 'Jane Smith',
        password: hashedPassword,
        emailVerified: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        email: 'bob.wilson@example.com',
        name: 'Bob Wilson',
        password: hashedPassword,
        emailVerified: new Date(),
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create workspaces
  console.log('💼 Creating workspaces...');
  const workspaces = await Promise.all([
    prisma.workspace.create({
      data: {
        name: 'Personal Workspace',
        description: 'My personal tasks and projects',
        type: 'PERSONAL',
        ownerId: users[0].id,
        members: {
          create: {
            userId: users[0].id,
            role: 'OWNER',
          },
        },
      },
    }),
    prisma.workspace.create({
      data: {
        name: 'Company Projects',
        description: 'Work-related projects',
        type: 'WORK',
        ownerId: users[1].id,
        members: {
          create: [
            {
              userId: users[1].id,
              role: 'OWNER',
            },
            {
              userId: users[0].id,
              role: 'MEMBER',
            },
          ],
        },
      },
    }),
  ]);

  console.log(`✅ Created ${workspaces.length} workspaces`);

  // Create workflows
  console.log('🔄 Creating workflows...');
  const workflows = await Promise.all([
    prisma.workflow.create({
      data: {
        name: 'Backlog',
        workspaceId: workspaces[0].id,
        order: 0,
      },
    }),
    prisma.workflow.create({
      data: {
        name: 'In Progress',
        workspaceId: workspaces[0].id,
        order: 1,
      },
    }),
    prisma.workflow.create({
      data: {
        name: 'Completed',
        workspaceId: workspaces[0].id,
        order: 2,
      },
    }),
  ]);

  console.log(`✅ Created ${workflows.length} workflows`);

  // Create projects
  console.log('📁 Creating projects...');
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: 'Website Redesign',
        description: 'Redesign company website with new branding',
        workspaceId: workspaces[0].id,
        workflowId: workflows[0].id,
        color: '#3b82f6',
        ownerId: users[0].id,
        status: 'ACTIVE',
      },
    }),
    prisma.project.create({
      data: {
        name: 'Mobile App Development',
        description: 'Build cross-platform mobile app',
        workspaceId: workspaces[0].id,
        workflowId: workflows[0].id,
        color: '#10b981',
        ownerId: users[0].id,
        status: 'ACTIVE',
      },
    }),
    prisma.project.create({
      data: {
        name: 'Marketing Campaign',
        description: 'Q1 marketing initiatives',
        workspaceId: workspaces[1].id,
        workflowId: workflows[0].id,
        color: '#f59e0b',
        ownerId: users[1].id,
        status: 'PLANNING',
      },
    }),
  ]);

  console.log(`✅ Created ${projects.length} projects`);

  // Create tags
  console.log('🏷️  Creating tags...');
  const tags = await Promise.all([
    prisma.tag.create({
      data: {
        name: 'urgent',
        color: '#ef4444',
        workspaceId: workspaces[0].id,
        ownerId: users[0].id,
      },
    }),
    prisma.tag.create({
      data: {
        name: 'feature',
        color: '#3b82f6',
        workspaceId: workspaces[0].id,
        ownerId: users[0].id,
      },
    }),
    prisma.tag.create({
      data: {
        name: 'bug',
        color: '#f59e0b',
        workspaceId: workspaces[0].id,
        ownerId: users[0].id,
      },
    }),
    prisma.tag.create({
      data: {
        name: 'enhancement',
        color: '#10b981',
        workspaceId: workspaces[1].id,
        ownerId: users[1].id,
      },
    }),
  ]);

  console.log(`✅ Created ${tags.length} tags`);

  // Create tasks
  console.log('✅ Creating tasks...');
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Design new homepage',
        description: 'Create mockups for the new homepage design',
        status: 'TODO',
        priority: 'HIGH',
        ownerId: users[0].id,
        projectId: projects[0].id,
        workflowId: workflows[0].id,
        workspaceId: workspaces[0].id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        tags: {
          connect: [{ id: tags[0].id }, { id: tags[1].id }],
        },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Implement user authentication',
        description: 'Add JWT-based authentication system',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        ownerId: users[0].id,
        projectId: projects[1].id,
        workflowId: workflows[1].id,
        workspaceId: workspaces[0].id,
        assigneeId: users[0].id,
        tags: {
          connect: [{ id: tags[0].id }, { id: tags[1].id }],
        },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Fix navigation bug',
        description: 'Mobile menu not closing properly',
        status: 'TODO',
        priority: 'MEDIUM',
        ownerId: users[0].id,
        projectId: projects[0].id,
        workflowId: workflows[0].id,
        workspaceId: workspaces[0].id,
        tags: {
          connect: [{ id: tags[2].id }],
        },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Write API documentation',
        description: 'Document all REST endpoints',
        status: 'DONE',
        priority: 'LOW',
        ownerId: users[1].id,
        projectId: projects[1].id,
        workflowId: workflows[2].id,
        workspaceId: workspaces[1].id,
        completedAt: new Date(),
        tags: {
          connect: [{ id: tags[3].id }],
        },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Set up CI/CD pipeline',
        description: 'Configure GitHub Actions for automated deployment',
        status: 'TODO',
        priority: 'MEDIUM',
        ownerId: users[1].id,
        projectId: projects[1].id,
        workflowId: workflows[0].id,
        workspaceId: workspaces[1].id,
      },
    }),
  ]);

  console.log(`✅ Created ${tasks.length} tasks`);

  // Create sample time sessions
  console.log('⏱️  Creating time sessions...');
  await Promise.all([
    prisma.timeSession.create({
      data: {
        taskId: tasks[1].id,
        userId: users[0].id,
        type: 'POMODORO',
        duration: 1500, // 25 minutes
        startTime: new Date(Date.now() - 1500 * 1000),
        endTime: new Date(),
      },
    }),
    prisma.timeSession.create({
      data: {
        taskId: tasks[3].id,
        userId: users[1].id,
        type: 'CONTINUOUS',
        duration: 3600, // 1 hour
        startTime: new Date(Date.now() - 2 * 3600 * 1000),
        endTime: new Date(Date.now() - 3600 * 1000),
      },
    }),
  ]);

  console.log('✅ Created time sessions');

  // Create user preferences
  console.log('⚙️  Creating user preferences...');
  await Promise.all([
    prisma.userPreferences.create({
      data: {
        userId: users[0].id,
        theme: 'system',
        language: 'en',
        pomodoroDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        autoStartBreaks: false,
        autoStartPomodoros: false,
        notificationsEnabled: true,
        email: 'john.doe@example.com',
      },
    }),
    prisma.userPreferences.create({
      data: {
        userId: users[1].id,
        theme: 'dark',
        language: 'es',
        pomodoroDuration: 30,
        shortBreakDuration: 10,
        longBreakDuration: 20,
        autoStartBreaks: true,
        autoStartPomodoros: false,
        notificationsEnabled: true,
        email: 'jane.smith@example.com',
      },
    }),
  ]);

  console.log('✅ Created user preferences');

  console.log('\n✨ Database seeded successfully!');
  console.log('\n📝 Test users:');
  console.log('   john.doe@example.com / password123');
  console.log('   jane.smith@example.com / password123');
  console.log('   bob.wilson@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
