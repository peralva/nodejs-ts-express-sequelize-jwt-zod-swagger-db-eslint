import assert from 'node:assert';
import { describe, it } from 'node:test';
import { z } from 'zod';
import ConflictError from './ConflictError.js';

describe(
    __filename,
    () => {
        it(() => {
            assert.deepStrictEqual(
                z.object({
                    name: z.string(),
                    message: z.string(),
                    status: z.number(),
                }).parse(new ConflictError('Test')),
                {
                    name: 'ConflictError',
                    message: 'Test',
                    status: 409,
                },
            );
        });
    },
);
