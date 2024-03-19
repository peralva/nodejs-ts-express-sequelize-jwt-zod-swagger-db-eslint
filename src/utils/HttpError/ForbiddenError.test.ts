import assert from 'node:assert';
import { describe, it } from 'node:test';
import { z } from 'zod';
import ForbiddenError from './ForbiddenError.js';

describe(
    __filename,
    () => {
        it(() => {
            assert.deepStrictEqual(
                z.object({
                    name: z.string(),
                    message: z.string(),
                    status: z.number(),
                }).parse(new ForbiddenError('Test')),
                {
                    name: 'ForbiddenError',
                    message: 'Test',
                    status: 403,
                },
            );
        });
    },
);
