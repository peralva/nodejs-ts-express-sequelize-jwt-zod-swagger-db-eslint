import User from '../models/User.js';
import NotFoundError from './HttpError/NotFoundError.js';

export default async (
    id: number,
    { returnPassword }: { returnPassword?: boolean } = {},
) => {
    const result = await User.findOne({
        where: { id },
        attributes: {
            include: returnPassword ? ['password'] : [],
        },
    });

    if (!result) {
        throw new NotFoundError(`Usuário (${id}) não encontrado`);
    }

    return result;
};
