const { PrismaClient } = require('@prisma/client');

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function checkWorkspace() {
  try {
    // Buscar el workspace "Carros"
    const workspace = await prisma.workspace.findFirst({
      where: {
        name: { contains: 'carros', mode: 'insensitive' }
      }
    });

    console.log('\n=== Workspace "Carros" ===');
    if (workspace) {
      console.log('ID:', workspace.id);
      console.log('Name:', workspace.name);
      console.log('Slug:', workspace.slug);
      console.log('isDeleted:', workspace.isDeleted);
      console.log('deletedAt:', workspace.deletedAt);
      console.log('isArchived:', workspace.isArchived);
      console.log('Owner ID:', workspace.ownerId);
    } else {
      console.log('❌ No se encontró ningún workspace llamado "Carros"');
    }

    // Listar todos los workspaces eliminados
    console.log('\n=== Todos los Workspaces Eliminados ===');
    const deletedWorkspaces = await prisma.workspace.findMany({
      where: { isDeleted: true },
      select: {
        id: true,
        name: true,
        slug: true,
        deletedAt: true,
        ownerId: true
      }
    });

    if (deletedWorkspaces.length > 0) {
      console.log(`Found ${deletedWorkspaces.length} deleted workspaces:`);
      deletedWorkspaces.forEach(ws => {
        console.log(`  - ${ws.name} (slug: ${ws.slug}, deleted: ${ws.deletedAt})`);
      });
    } else {
      console.log('❌ No hay workspaces eliminados');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkWorkspace();
