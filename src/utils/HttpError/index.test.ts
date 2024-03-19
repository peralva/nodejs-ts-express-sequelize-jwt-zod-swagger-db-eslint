import assert from 'node:assert';
import { describe, it } from 'node:test';
import { z } from 'zod';
import HttpError from './index.js';

describe(
    __filename,
    () => {
        it(() => {
            assert.deepStrictEqual(
                z.object({
                    name: z.string(),
                    message: z.string(),
                    status: z.number(),
                }).parse(new HttpError('Test', 400)),
                {
                    name: 'HttpError',
                    message: 'Test',
                    status: 400,
                },
            );
        });
    },
);
