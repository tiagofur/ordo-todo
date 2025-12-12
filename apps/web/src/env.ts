import { z } from 'zod';

const envSchema = z.object({
    // Server-side variables
    DATABASE_URL: z.string().url().optional(), // Optional for build time if not using DB during build
    NEXTAUTH_SECRET: z.string().min(1).optional(), // Optional for build
    NEXTAUTH_URL: z.string().url().optional(),

    // Optional integrations
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),

    // Client-side variables
    NEXT_PUBLIC_API_URL: z.string().url().default('https://api.ordotodo.app/api/v1'),
});

const processEnv = {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    NEXT_PUBLIC_API_URL: (() => {
        const url = process.env.NEXT_PUBLIC_API_URL;
        // Logic to fix missing /api/v1 in production if it happens
        if (process.env.NODE_ENV === 'production') {
            if (!url) return 'https://api.ordotodo.app/api/v1';
            if (!url.endsWith('/api/v1')) return `${url}/api/v1`;
        }
        return url;
    })(),
};

// Validate on runtime
const parsed = envSchema.safeParse(processEnv);

if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
    // Only throw in production or if critical variables are missing in dev
    if (process.env.NODE_ENV === 'production') {
        throw new Error('Invalid environment variables');
    }
}

export const env = parsed.success ? parsed.data : processEnv as z.infer<typeof envSchema>;
