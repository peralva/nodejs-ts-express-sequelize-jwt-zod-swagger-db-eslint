import assert from 'node:assert';
import { describe, it } from 'node:test';
import getDataCached from './getDataCached.js';
import sleep from './sleep.js';

describe(
    __filename,
    () => {
        it(async () => {
            assert.strictEqual(
                await getDataCached(
                    () => 1,
                    {
                        alias: '123',
                        cachedTime: 1000,
                    },
                ),
                1,
                'criando cache',
            );

            assert.strictEqual(
                await getDataCached(
                    () => 2,
                    {
                        alias: '123',
                        cachedTime: 1000,
                    },
                ),
                1,
                'pega do cache',
            );

            await sleep(1000);

            assert.strictEqual(
                await getDataCached(
                    () => 3,
                    {
                        alias: '123',
                        cachedTime: 1000,
                    },
                ),
                3,
                'cache expirou, recriando',
            );
        });
    },
);
