import assert from 'node:assert';
import { describe, it } from 'node:test';
import validateEnv from './validateEnv.js';

describe(
    __filename,
    () => {
        it(() => {
            assert.deepStrictEqual(
                validateEnv({}),
                {
                    SERVICE_PORT: '80',
                    JWT_SECRET: ' ',
                    NODE_ENV: 'development',
                },
            );
        });
    },
);
