import assert from 'node:assert';
import { describe, it } from 'node:test';
import { z } from 'zod';
import MethodNotAllowedError from './MethodNotAllowedError.js';

describe(
    __filename,
    () => {
        it(() => {
            assert.deepStrictEqual(
                z.object({
                    name: z.string(),
                    message: z.string(),
                    status: z.number(),
                }).parse(new MethodNotAllowedError('Test')),
                {
                    name: 'MethodNotAllowedError',
                    message: 'Test',
                    status: 405,
                },
            );
        });
    },
);
