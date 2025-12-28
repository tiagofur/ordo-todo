import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function checkWorkspaces() {
  try {
    console.log('\n=== Checking All Workspaces ===\n');

    // Get all workspaces
    const allWorkspaces = await prisma.workspace.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        isDeleted: true,
        deletedAt: true,
        ownerId: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`Total workspaces: ${allWorkspaces.length}\n`);

    // Separate active and deleted
    const active = allWorkspaces.filter((w) => !w.isDeleted);
    const deleted = allWorkspaces.filter((w) => w.isDeleted);

    console.log('--- Active Workspaces ---');
    if (active.length === 0) {
      console.log('No active workspaces');
    } else {
      active.forEach((ws) => {
        console.log(`  - ${ws.name} (slug: ${ws.slug})`);
      });
    }

    console.log('\n--- Deleted Workspaces ---');
    if (deleted.length === 0) {
      console.log('No deleted workspaces');
    } else {
      deleted.forEach((ws) => {
        console.log(`  - ${ws.name} (slug: ${ws.slug}, deleted: ${ws.deletedAt})`);
      });
    }

    // Check specifically for "Carros"
    console.log('\n=== Looking for "Carros" ===');
    const carros = allWorkspaces.filter((w) =>
      w.name.toLowerCase().includes('carros')
    );

    if (carros.length === 0) {
      console.log('❌ No workspaces found containing "carros"');
    } else {
      carros.forEach((ws) => {
        console.log(`\nFound: ${ws.name}`);
        console.log(`  ID: ${ws.id}`);
        console.log(`  Slug: ${ws.slug}`);
        console.log(`  Deleted: ${ws.isDeleted ? 'YES' : 'NO'}`);
        console.log(`  Deleted At: ${ws.deletedAt || 'N/A'}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkWorkspaces();
