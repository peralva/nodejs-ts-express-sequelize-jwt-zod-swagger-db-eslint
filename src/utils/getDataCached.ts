/* eslint-disable no-param-reassign */

import EventEmitter from 'events';

const cache: {
    [ alias: string ]: {
        events: EventEmitter[],
        result?: unknown,
        error?: unknown,
        returned?: boolean,
    },
} = {};

export default async (
    callback: () => unknown | Promise<unknown>,
    {
        alias,
        cachedTime = 1000,
    }: {
        alias?: unknown,
        cachedTime?: number,
    } = {},
) => {
    if (cachedTime > 2147483647) {
        cachedTime = 2147483647;
    }

    const eventName = JSON.stringify({
        alias,
        cachedTime,
    });

    const event = new EventEmitter();

    const resultPromise = new Promise((resolve, reject) => {
        event.once(
            '',
            (resultEvent, error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(resultEvent);
                }
            },
        );
    });

    if (eventName in cache) {
        if (cache[eventName].returned) {
            event.emit('', cache[eventName].result, cache[eventName].error);
        } else {
            cache[eventName].events.push(event);
        }
    } else {
        cache[eventName] = {
            events: [event],
        };

        try {
            cache[eventName].result = await callback();
        } catch (err) {
            cache[eventName].error = err;

            if (cachedTime > 1000) {
                cachedTime = 1000;
            }
        }

        cache[eventName].returned = true;

        cache[eventName].events.forEach((value) => {
            value.emit('', cache[eventName].result, cache[eventName].error);
        });

        setTimeout(
            () => {
                delete cache[eventName];
            },
            cachedTime,
        );
    }

    return await resultPromise;
};
