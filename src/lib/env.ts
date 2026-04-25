import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  AUTH_URL: z.string().url().optional(),
  BLOB_READ_WRITE_TOKEN: z.string().min(1),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

// Neon's Vercel integration injects channel_binding=require into pooled URLs which breaks
// Prisma's pg driver. DATABASE_URL_UNPOOLED is the clean fallback without that parameter.
const raw = {
  ...process.env,
  DATABASE_URL:
    process.env.DATABASE_URL_UNPOOLED ??
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL,
};

const parsed = envSchema.safeParse(raw);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const env = parsed.data;
