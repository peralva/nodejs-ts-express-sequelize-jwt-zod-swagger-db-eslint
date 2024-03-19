import { z } from 'zod';
import User, { USER_SCHEMA } from '../../../models/User.js';
import NotFoundError from '../../../utils/HttpError/NotFoundError.js';

export const PARAMS_SCHEMA = z.object({ id: z.preprocess((arg) => Number(arg), USER_SCHEMA.id) });

export default async ({
    params,
}: {
    params: z.infer<typeof PARAMS_SCHEMA>,
}) => {
    const result = await User.destroy(
        { where: params },
    );

    if (!result) {
        throw new NotFoundError(`Usuário (${params.id}) não encontrado`);
    }
};

export const DOCS = {
    summary: 'Deletar usuário',
    responses: {
        204: { description: 'Usuário deletado' },
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
