const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixCompletedField() {
  try {
    console.log('Updating projects with null completed field...');
    
    const result = await prisma.$executeRaw`
      UPDATE "Project" 
      SET completed = false, "updatedAt" = NOW()
      WHERE completed IS NULL
    `;
    
    console.log(`✅ Updated ${result} projects`);
    
    // Verify
    const projects = await prisma.project.findMany({
      select: { id: true, name: true, completed: true }
    });
    
    console.log('\nAll projects:');
    projects.forEach(p => {
      console.log(`- ${p.name}: completed = ${p.completed}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixCompletedField();
