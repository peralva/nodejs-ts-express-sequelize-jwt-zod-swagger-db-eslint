import { z } from 'zod';
import User from '../../../models/User.js';

export const HEADERS_SCHEMA = z.object({
    'include-created_by': z.preprocess((arg) => arg === 'true', z.boolean()),
    'include-updated_by': z.preprocess((arg) => arg === 'true', z.boolean()),
});

export const PARAMS_SCHEMA = z.object({ id: z.preprocess((arg) => Number(arg), z.number().int()) });

export default async ({
    headers,
    params,
}: {
    headers: z.infer<typeof HEADERS_SCHEMA>,
    params: z.infer<typeof PARAMS_SCHEMA>,
}) => {
    const include = [];

    if (headers['include-created_by']) {
        include.push({
            model: User,
            as: 'created_by',
        });
    }

    if (headers['include-updated_by']) {
        include.push({
            model: User,
            as: 'updated_by',
        });
    }

    return await User.findByPk(
        params.id,
        { include },
    );
};

export const DOCS = {
    summary: 'Dados de um usuário',
    responses: {
        200: {
            description: 'Dados do usuário',
            content: {
                'application/json': {
                    schema: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/User' },
                    },
                },
            },
        },
    },
};
