import assert from 'node:assert';
import { describe, it } from 'node:test';
import { z } from 'zod';
import NotFoundError from './NotFoundError.js';

describe(
    __filename,
    () => {
        it(() => {
            assert.deepStrictEqual(
                z.object({
                    name: z.string(),
                    message: z.string(),
                    status: z.number(),
                }).parse(new NotFoundError('Test')),
                {
                    name: 'NotFoundError',
                    message: 'Test',
                    status: 404,
                },
            );
        });
    },
);
