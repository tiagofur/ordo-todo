// Script to check workspace status in database
// Usage: cd apps/web && node scripts/check-workspace.mjs

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function checkWorkspaces() {
  try {
    console.log('\n🔍 Checking all workspaces containing "carros"...\n');

    const workspaces = await prisma.workspace.findMany({
      where: {
        name: {
          contains: 'carros',
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        isDeleted: true,
        deletedAt: true,
        ownerId: true,
      },
    });

    if (workspaces.length === 0) {
      console.log('❌ No workspaces found containing "carros"\n');
      return;
    }

    console.log(`✅ Found ${workspaces.length} workspace(s):\n`);

    workspaces.forEach((ws, index) => {
      console.log(`${index + 1}. ${ws.name}`);
      console.log(`   ID: ${ws.id}`);
      console.log(`   Slug: ${ws.slug}`);
      console.log(`   Owner ID: ${ws.ownerId}`);
      console.log(`   Is Deleted: ${ws.isDeleted ? '✅ YES' : '❌ NO'}`);
      console.log(`   Deleted At: ${ws.deletedAt || 'N/A'}`);
      console.log('');
    });

    // Summary
    const deleted = workspaces.filter(w => w.isDeleted);
    const active = workspaces.filter(w => !w.isDeleted);

    console.log('📊 Summary:');
    console.log(`   Active: ${active.length}`);
    console.log(`   Deleted: ${deleted.length}`);
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkWorkspaces();
