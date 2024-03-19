import assert from 'node:assert';
import { describe, it } from 'node:test';
import { z } from 'zod';
import NotAcceptableError from './NotAcceptableError.js';

describe(
    __filename,
    () => {
        it(() => {
            assert.deepStrictEqual(
                z.object({
                    name: z.string(),
                    message: z.string(),
                    status: z.number(),
                }).parse(new NotAcceptableError('Test')),
                {
                    name: 'NotAcceptableError',
                    message: 'Test',
                    status: 406,
                },
            );
        });
    },
);
