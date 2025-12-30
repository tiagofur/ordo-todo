import { PrismaClient } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient();
    try {
        const workspaces = await prisma.workspace.findMany({
            include: { owner: true }
        });
        console.log(`Found ${workspaces.length} workspaces.`);
        for (const w of workspaces) {
            console.log(`- ID: ${w.id}, Name: ${w.name}, Slug: ${w.slug}, Owner: ${w.owner?.username}`);
        }
    } catch (error) {
        console.error('Error connecting to DB:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
