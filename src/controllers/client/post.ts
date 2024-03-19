import { z } from 'zod';
import { sequelize } from '../../models/index.js';
import Client, { CLIENT_SCHEMA } from '../../models/Client.js';
import Group from '../../models/Group.js';
import User from '../../models/User.js';

export const BODY_OR_QUERY_SCHEMA = z.object(CLIENT_SCHEMA);

export default async ({
    body,
    user,
}: {
    body: z.infer<typeof BODY_OR_QUERY_SCHEMA>
    user: User,
}) => await sequelize.transaction(async (t) => await Client.create(
    {
        ...body,
        updated_by_id: user.id,
        groups: body.groups ? body.groups.map((value) => ({
            ...value,
            updated_by_id: user.id,
        })) : [],
    },
    {
        transaction: t,
        include: {
            model: Group,
            as: 'groups',
        },
    },
));

export const DOCS = {
    summary: 'Criar cliente',
    responses: {
        201: {
            description: 'Cliente criado',
            content: {
                'application/json': {
                    schema: { $ref: '#/components/schemas/Client' },
                },
            },
        },
    },
};
