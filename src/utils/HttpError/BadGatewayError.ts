import HttpError from './index.js';

/**
 * Foi encaminhado para outro serviço que não atendeu a requisição
 */
export default class BadGatewayError extends HttpError {
    constructor(message: string) {
        super(message, 502);
    }
}
