import User from '../../models/User.js';

export default async ({
    offset,
    limit,
}: {
    offset: number,
    limit: number
}) => await User.findAll({
    offset,
    limit,
});

export const DOCS = {
    summary: 'Listar usuários',
    responses: {
        200: {
            description: 'Usuários encontrados',
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
