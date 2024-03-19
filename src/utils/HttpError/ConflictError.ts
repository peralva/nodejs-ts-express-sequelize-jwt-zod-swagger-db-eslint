import HttpError from './index.js';

/**
 * Recurso já existe
 */
export default class ConflictError extends HttpError {
    constructor(message: string) {
        super(message, 409);
    }
}
