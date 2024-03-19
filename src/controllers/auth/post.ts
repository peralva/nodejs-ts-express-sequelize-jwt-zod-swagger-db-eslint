import { z } from 'zod';
import { Response } from 'express';
import validateUser from '../../utils/validateUser.js';
import UnauthorizedError from '../../utils/HttpError/UnauthorizedError.js';
import Jwt from '../../utils/Jwt.js';
import defineResponseToken from '../../utils/defineResponseToken.js';
import { USER_SCHEMA, getPasswordHashed } from '../../models/User.js';

export const BODY_OR_QUERY_SCHEMA = z.object({
    id: USER_SCHEMA.id,
    password: USER_SCHEMA.password,
}).required({ password: true });

export default async ({
    body,
    res,
}: {
    body: z.infer<typeof BODY_OR_QUERY_SCHEMA>,
    res: Response,
}) => {
    const result = await validateUser(body.id, { returnPassword: true });

    if (result.password !== getPasswordHashed(result.id, body.password)) {
        defineResponseToken(res);
        throw new UnauthorizedError('Senha inválida');
    }

    const token = Jwt.generateToken({ user_id: result.id });
    defineResponseToken(res, token);

    result.setDataValue('password', undefined);
    return result;
};

export const DOCS = {
    summary: 'Autenticação',
    responses: {
        201: {
            description: 'Usuário autenticado',
            content: {
                'application/json': {
                    schema: { $ref: '#/components/schemas/User' },
                },
            },
        },
        401: {
            description: 'Senha inválida',
            content: {
                'application/json': {
                    schema: { $ref: '#/components/schemas/Error' },
                },
            },
        },
    },
};
