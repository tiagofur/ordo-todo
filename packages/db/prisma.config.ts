import { defineConfig } from '@prisma/config';

export default defineConfig({
    datasource: {
        provider: 'postgresql',
        url: process.env.DATABASE_URL || 'postgresql://ordo:ordo_dev_password@localhost:3433/ordo_todo',
    },
});
