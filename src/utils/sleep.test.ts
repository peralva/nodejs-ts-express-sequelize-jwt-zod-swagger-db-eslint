import assert from 'node:assert';
import { describe, it } from 'node:test';
import sleep from './sleep.js';

describe(
    __filename,
    () => {
        it(async () => {
            const startDate = new Date();
            await sleep(500);
            const endDate = new Date();

            assert(endDate.getTime() - startDate.getTime() < 520);
        });
    },
);
