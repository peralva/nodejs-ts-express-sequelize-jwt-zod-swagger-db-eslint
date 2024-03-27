import { Order } from 'sequelize';
import Client from '../../models/Client.js';

export default async ({
    order,
    offset,
    limit,
}: {
    order: Order,
    offset: number,
    limit: number
}) => await Client.findAll({
    order,
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
