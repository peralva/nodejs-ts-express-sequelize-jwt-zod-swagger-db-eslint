import { describe, it } from 'node:test';
import { z } from 'zod';
import config from './config.js';

describe(
    __filename,
    () => {
        it(() => {
            z.object({
                defaultLimit: z.number().int().min(1),
                sessionTimeInMinutes: z.number().int().min(1).optional(),
            }).parse(config);
        });
    },
);
