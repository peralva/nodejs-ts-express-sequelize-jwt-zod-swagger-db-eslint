import { z } from 'zod';
import User, { USER_SCHEMA, getPasswordHashed } from '../../models/User.js';
import { sequelize } from '../../models/index.js';

export const BODY_OR_QUERY_SCHEMA = z.object({
    name: USER_SCHEMA.name,
    password: USER_SCHEMA.password,
}).required({ password: true });

export default async ({
    body,
    user,
}: {
    body: z.infer<typeof BODY_OR_QUERY_SCHEMA>,
    user?: User,
}) => {
    const { password, ...values } = body;

    return await sequelize.transaction(async (t) => {
        const result = await User.create(
            {
                ...values,
                updated_by_id: user?.id,
            },
            { transaction: t },
        );

        await User.update(
            {
                password: getPasswordHashed(result.id, password),
                updated_by_id: user?.id,
            },
            {
                transaction: t,
                where: { id: result.id },
            },
        );

        return result;
    });
};

export const DOCS = {
    summary: 'Criar usuário',
    responses: {
        201: {
            description: 'Usuário criado',
            content: {
                'application/json': {
                    schema: { $ref: '#/components/schemas/User' },
                },
            },
        },
    },
};
