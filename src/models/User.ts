import { createHash } from 'crypto';
import { DataTypes, Model } from 'sequelize';
import { z } from 'zod';

export const getPasswordHashed = (id: number, password: string) => createHash('SHA512').update(`${id}:${password}`).digest('hex');

const USER_NAME_LENGTH = 64;

export const USER_SCHEMA = {
    id: z.number().int().min(1),
    name: z.string().min(1).max(USER_NAME_LENGTH),
    password: z.string().min(1).optional(),
};

export default class User extends Model {
    declare id: number;

    declare password: string | null;
}

export const ATTRIBUTES = {
    name: {
        type: DataTypes.STRING(USER_NAME_LENGTH),
        allowNull: false,
        validate: { notEmpty: true },
    },
    password: {
        type: DataTypes.STRING(128),
        allowNull: true,
        validate: { notEmpty: true },
    },
};

export const OPTIONS = {
    indexes: [{
        unique: true,
        fields: ['password'],
    }],
    defaultScope: {
        attributes: {
            exclude: ['password'],
        },
    },
};
