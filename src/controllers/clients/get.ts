import Client from '../../models/Client.js';

export default async ({
    offset,
    limit,
}: {
    offset: number,
    limit: number
}) => await Client.findAll({
    offset,
    limit,
});

export const DOCS = {
    summary: 'Listar clientes',
    responses: {
        200: {
            description: 'Clientes encontrados',
            content: {
                'application/json': {
                    schema: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Client' },
                    },
                },
            },
        },
    },
};
