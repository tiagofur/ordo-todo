import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
    schema: 'prisma/schema.prisma',
    datasource: {
        url: env('DATABASE_URL') || 'postgresql://ordo:ordo_dev_password@localhost:3433/ordo_todo',
    },
    migrations: {
        seed: 'node prisma/seed.js',
    },
});
