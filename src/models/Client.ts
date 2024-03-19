import { DataTypes, Model } from 'sequelize';
import { z } from 'zod';
import { models } from './index.js';
import { GROUP_SCHEMA } from './Group.js';

const CLIENT_NAME_LENGTH = 64;
const CLIENT_EMAIL_LENGTH = 64;

export const CLIENT_SCHEMA = {
    name: z.string().min(1).max(CLIENT_NAME_LENGTH),
    email: z.string().email().max(CLIENT_EMAIL_LENGTH).optional(),
    groups: z.array(z.object(GROUP_SCHEMA)).optional(),
};

export default class Client extends Model {}

export const ATTRIBUTES = {
    name: {
        type: DataTypes.STRING(CLIENT_NAME_LENGTH),
        allowNull: false,
        validate: { notEmpty: true },
    },
    email: {
        type: DataTypes.STRING(CLIENT_EMAIL_LENGTH),
        allowNull: true,
        validate: {
            notEmpty: true,
            isEmail: true,
        },
    },
};

export const OPTIONS = {
    indexes: [{
        unique: true,
        fields: ['email'],
    }],
};

export const ASSOCIATIONS = () => [
    {
        association: 'belongsToMany',
        target: models.Group,
        options: {
            as: 'groups',
            through: models.ClientVsGroup,
            foreignKey: {
                name: 'client_id',
                allowNull: false,
            },
        },
    },
    {
        association: 'hasMany',
        target: models.ClientVsGroup,
        options: {
            as: 'vs_groups',
            foreignKey: {
                name: 'client_id',
                allowNull: false,
            },
        },
    },
];
