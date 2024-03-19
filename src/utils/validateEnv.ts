import { z } from 'zod';

// eslint-disable-next-line no-undef
export default (env: NodeJS.ProcessEnv) => z.object({
    JWT_SECRET: z.string().min(1).optional().default(' '),
    NODE_ENV: z.string().min(1).optional().default('development'),
    SERVICE_PORT: (z.string()
        .min(1)
        .max(5)
        .optional()
        .default('80')
    ),
}).parse(env);
