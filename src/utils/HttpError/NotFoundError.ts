import HttpError from './index.js';

/**
 * Recurso não encontrado
 */
export default class NotFoundError extends HttpError {
    constructor(message: string) {
        super(message, 404);
    }
}
