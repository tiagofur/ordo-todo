import { defineConfig } from '@prisma/config';

export default defineConfig({
    datasource: {
        provider: 'postgresql',
        url: process.env.DATABASE_URL || 'postgresql://ordo:ordo_dev_password@localhost:5433/ordo_todo',
    },
});
