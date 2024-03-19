import { z } from 'zod';
import Client from '../../../models/Client.js';
import User from '../../../models/User.js';
import Group from '../../../models/Group.js';
import ClientVsGroup from '../../../models/ClientVsGroup.js';

export const HEADERS_SCHEMA = z.object({
    'include-created_by': z.preprocess((arg) => arg === 'true', z.boolean()),
    'include-updated_by': z.preprocess((arg) => arg === 'true', z.boolean()),
    'include-groups': z.preprocess((arg) => arg === 'true', z.boolean()),
    'include-vs_groups': z.preprocess((arg) => arg === 'true', z.boolean()),
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

    if (headers['include-groups']) {
        include.push({
            model: Group,
            as: 'groups',
        });
    }

    if (headers['include-vs_groups']) {
        include.push({
            model: ClientVsGroup,
            as: 'vs_groups',
        });
    }

    return await Client.findByPk(
        params.id,
        { include },
    );
};

export const DOCS = {
    summary: 'Dados de um cliente',
    responses: {
        200: {
            description: 'Dados do cliente',
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
