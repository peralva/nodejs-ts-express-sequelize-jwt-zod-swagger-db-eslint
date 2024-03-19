import assert from 'node:assert';
import { describe, it } from 'node:test';
import { z } from 'zod';
import ServiceUnavailableError from './ServiceUnavailableError.js';

describe(
    __filename,
    () => {
        it(() => {
            assert.deepStrictEqual(
                z.object({
                    name: z.string(),
                    message: z.string(),
                    status: z.number(),
                }).parse(new ServiceUnavailableError('Test')),
                {
                    name: 'ServiceUnavailableError',
                    message: 'Test',
                    status: 503,
                },
            );
        });
    },
);
