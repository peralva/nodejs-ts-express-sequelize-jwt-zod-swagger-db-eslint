import { Order } from 'sequelize';
import User from '../../models/User.js';

export default async ({
    order,
    offset,
    limit,
}: {
    order: Order,
    offset: number,
    limit: number
}) => await User.findAll({
    order,
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
