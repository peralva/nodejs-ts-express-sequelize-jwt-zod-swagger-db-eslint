import HttpError from './index.js';

/**
 * Passagem de parâmetros incorreta
 */
export default class NotAcceptableError extends HttpError {
    constructor(message: string) {
        super(message, 406);
    }
}
