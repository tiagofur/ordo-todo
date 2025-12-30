import { PrismaClient } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient();
    const workspaces = await prisma.workspace.findMany({
        take: 10,
        include: { owner: true }
    });
    console.log(JSON.stringify(workspaces, null, 2));
    await prisma.$disconnect();
}

main();
