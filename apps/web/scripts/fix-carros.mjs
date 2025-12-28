// Script para marcar workspaces "Carros" como eliminados
// Uso: cd apps/web && node --import=tsx scripts/fix-carros.mjs

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixCarrosWorkspaces() {
  try {
    console.log('🔍 Buscando workspaces "Carros"...');

    // Buscar todos los workspaces que contengan "carros" (case insensitive)
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
      },
    });

    console.log(`\n✅ Encontrados ${workspaces.length} workspaces:`);
    workspaces.forEach((ws) => {
      console.log(`  - ${ws.name} (deleted: ${ws.isDeleted})`);
    });

    // Actualizar cada uno
    console.log('\n🔄 Marcando como eliminados...');
    for (const ws of workspaces) {
      if (!ws.isDeleted) {
        await prisma.workspace.update({
          where: { id: ws.id },
          data: {
            isDeleted: true,
            deletedAt: new Date(),
          },
        });
        console.log(`  ✓ ${ws.name} -> marcado como eliminado`);
      } else {
        console.log(`  - ${ws.name} -> ya estaba eliminado`);
      }
    }

    console.log('\n✨ Listo! Ahora los workspaces deberían aparecer en la papelera.');

    // Verificar
    const deletedWorkspaces = await prisma.workspace.findMany({
      where: {
        name: {
          contains: 'carros',
          mode: 'insensitive',
        },
        isDeleted: true,
      },
      select: {
        id: true,
        name: true,
        deletedAt: true,
      },
    });

    console.log(`\n📋 Workspaces en papelera: ${deletedWorkspaces.length}`);
    deletedWorkspaces.forEach((ws) => {
      console.log(`  - ${ws.name} (eliminado: ${ws.deletedAt?.toLocaleString('es-ES')})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixCarrosWorkspaces();
