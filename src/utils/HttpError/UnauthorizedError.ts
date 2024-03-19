import HttpError from './index.js';

/**
 * Usuário precisa se autenticar
 */
export default class UnauthorizedError extends HttpError {
    constructor(message: string) {
        super(message, 401);
    }
}
