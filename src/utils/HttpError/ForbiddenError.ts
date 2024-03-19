import HttpError from './index.js';

/**
 * Usuário não pode acessar este recurso
 */
export default class ForbiddenError extends HttpError {
    constructor(message: string) {
        super(message, 403);
    }
}
