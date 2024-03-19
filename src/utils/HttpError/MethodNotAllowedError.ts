import HttpError from './index.js';

/**
 * Método não permitido
 */
export default class MethodNotAllowedError extends HttpError {
    constructor(message: string) {
        super(message, 405);
    }
}
