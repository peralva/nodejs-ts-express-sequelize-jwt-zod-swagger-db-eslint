/* eslint-disable no-constant-condition */
/* eslint-disable no-await-in-loop */

import shutdown from '../index.js';
import sleep from './sleep.js';

const printError = (error: unknown) => {
    let err: Error;

    if (error instanceof Error) {
        err = error;
    } else {
        err = new Error(`Uma exceção foi provocada sem passar a instância de Error: ${JSON.stringify(error)}`);
    }

    // eslint-disable-next-line no-console
    console.error(new Date(), JSON.stringify(
        {
            cause: err.cause,
            ...err,
            name: err.name,
            message: err.message,
            stack: err.stack,
        },
        null,
        4,
    ));
};

const initShutdown = async () => {
    if (!shutdown.enabled) {
        shutdown.enabled = true;

        (async () => {
            while (true) {
                // eslint-disable-next-line no-console
                console.info(new Date(), `Serviço está sendo desligado... ${shutdown.running} endpoint${shutdown.running !== 1 ? 's' : ''} em execução`);
                await sleep(1000 * 10);
            }
        })();

        while (true) {
            if (!shutdown.running) {
                process.exit();
            } else {
                await sleep(1000);
            }
        }
    }
};

export default () => {
    process.on(
        'SIGINT',
        initShutdown,
    );

    process.on(
        'uncaughtException',
        (error) => {
            printError(error);
            initShutdown();
        },
    );

    process.on(
        'unhandledRejection',
        (reason) => {
            printError(reason);
            initShutdown();
        },
    );
};
