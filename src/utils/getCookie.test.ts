import assert from 'node:assert';
import { describe, it } from 'node:test';
import getCookie from './getCookie.js';

describe(
    __filename,
    () => {
        it(() => {
            assert.deepStrictEqual(
                getCookie('token=123; user=321'),
                {
                    token: '123',
                    user: '321',
                },
                'token=123; user=321',
            );

            assert.deepStrictEqual(getCookie(), {}, 'vazio');
        });
    },
);
