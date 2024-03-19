import assert from 'node:assert';
import { describe, it } from 'node:test';
import { z } from 'zod';
import BadGatewayError from './BadGatewayError.js';

describe(
    __filename,
    () => {
        it(() => {
            assert.deepStrictEqual(
                z.object({
                    name: z.string(),
                    message: z.string(),
                    status: z.number(),
                }).parse(new BadGatewayError('Test')),
                {
                    name: 'BadGatewayError',
                    message: 'Test',
                    status: 502,
                },
            );
        });
    },
);
