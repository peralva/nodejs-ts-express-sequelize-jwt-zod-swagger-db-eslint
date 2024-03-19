import assert from 'node:assert';
import { describe, it } from 'node:test';
import { z } from 'zod';
import UnauthorizedError from './UnauthorizedError.js';

describe(
    __filename,
    () => {
        it(() => {
            assert.deepStrictEqual(
                z.object({
                    name: z.string(),
                    message: z.string(),
                    status: z.number(),
                }).parse(new UnauthorizedError('Test')),
                {
                    name: 'UnauthorizedError',
                    message: 'Test',
                    status: 401,
                },
            );
        });
    },
);
