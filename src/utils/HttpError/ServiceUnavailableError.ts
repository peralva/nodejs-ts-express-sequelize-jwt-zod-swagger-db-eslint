import HttpError from './index.js';

/**
 * Servidor não está pronto para atender a solicitação
 */
export default class ServiceUnavailableError extends HttpError {
    constructor(message: string) {
        super(message, 503);
    }
}
