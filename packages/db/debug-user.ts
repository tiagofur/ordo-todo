
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Connecting...');
    try {
        const users = await prisma.user.findMany({
            take: 1,
            select: {
                id: true,
                email: true
            }
        });
        console.log('Found users:', users);

        if (users.length > 0) {
            const email = users[0].email;
            console.log(`Testing getFullProfile for ${email}...`);

            const user = await prisma.user.findUnique({
                where: { email },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    name: true,
                    emailVerified: true,
                    image: true,
                    phone: true,
                    jobTitle: true,
                    department: true,
                    bio: true,
                    timezone: true,
                    locale: true,
                    lastUsernameChangeAt: true,
                    createdAt: true,
                    updatedAt: true,
                    subscription: true,
                    integrations: true,
                    preferences: true,
                },
            });
            console.log('User fetched successfully:', user ? 'Yes' : 'No');
            if (user) {
                console.log('Preferences:', user.preferences);
                console.log('Subscription:', user.subscription);
            }
        } else {
            console.log('No users found in DB.');
        }

    } catch (e: any) {
        console.error('ERROR occurred:', e);
        console.error('Error Code:', e.code);
        console.error('Error Message:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
