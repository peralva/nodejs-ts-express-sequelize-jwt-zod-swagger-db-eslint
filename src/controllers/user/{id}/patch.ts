import { z } from 'zod';
import User, { USER_SCHEMA, getPasswordHashed } from '../../../models/User.js';
import NotFoundError from '../../../utils/HttpError/NotFoundError.js';

export const PARAMS_SCHEMA = z.object({ id: z.preprocess((arg) => Number(arg), USER_SCHEMA.id) });

export const BODY_OR_QUERY_SCHEMA = z.object({
    name: USER_SCHEMA.name.optional(),
    password: USER_SCHEMA.password,
}).refine(
    (arg) => Object.keys(arg).length > 0,
    'Precisa informar pelo menos um campo para ser alterado',
);

export default async ({
    params,
    body,
    user,
}: {
    params: z.infer<typeof PARAMS_SCHEMA>,
    body: z.infer<typeof BODY_OR_QUERY_SCHEMA>,
    user: User,
}) => {
    let passwordHashed;

    if (body.password) {
        passwordHashed = getPasswordHashed(params.id, body.password);
    }

    const result = await User.update(
        {
            ...body,
            password: passwordHashed,
            updated_by_id: user.id,
        },
        { where: params },
    );

    if (!result[0]) {
        throw new NotFoundError(`Usuário (${params.id}) não encontrado`);
    }
};

export const DOCS = {
    summary: 'Alterar usuário',
    responses: {
        204: { description: 'Usuário alterado' },
        404: {
            description: 'Usuário não encontrado',
            content: {
                'application/json': {
                    schema: { $ref: '#/components/schemas/Error' },
                },
            },
        },
    },
};
