import assert from 'node:assert';
import { describe, it } from 'node:test';
import { z } from 'zod';
import Jwt from './Jwt.js';
import validateEnv from './validateEnv.js';
import config from '../config.js';

describe(
    __filename,
    () => {
        it(() => {
            process.env = validateEnv(process.env);

            const date = new Date();

            const token = Jwt.generateToken({
                a: 1,
                b: '2',
            });

            const payload = Jwt.tokenToPayload(token);

            const data = z.object({
                a: z.number(),
                b: z.string(),
            }).parse(payload);

            assert.deepStrictEqual(
                data,
                {
                    a: 1,
                    b: '2',
                },
                'payload',
            );

            date.setUTCMilliseconds(0);

            assert.strictEqual(
                payload.iat,
                date.getTime() / 1000,
                'iat',
            );

            if (true
                && typeof payload.exp === 'number'
                && config.sessionTimeInMinutes
            ) {
                assert.strictEqual(
                    payload.exp - payload.iat,
                    config.sessionTimeInMinutes * 60,
                    'exp',
                );
            }
        });
    },
);
