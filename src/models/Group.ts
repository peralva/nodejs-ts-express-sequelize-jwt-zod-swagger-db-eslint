import { DataTypes, Model } from 'sequelize';
import { z } from 'zod';
import { models } from './index.js';

const GROUP_NAME_LENGTH = 16;

export const GROUP_SCHEMA = {
    name: z.string().min(1).max(GROUP_NAME_LENGTH),
};

export default class Group extends Model {}

export const ATTRIBUTES = {
    name: {
        type: DataTypes.STRING(GROUP_NAME_LENGTH),
        allowNull: false,
        validate: { notEmpty: true },
    },
};

export const OPTIONS = {
    indexes: [{
        unique: true,
        fields: ['name'],
    }],
};

export const ASSOCIATIONS = () => [
    {
        association: 'belongsToMany',
        target: models.Client,
        options: {
            as: 'clients',
            through: models.ClientVsGroup,
            foreignKey: {
                name: 'group_id',
                allowNull: false,
            },
        },
    },
    {
        association: 'hasMany',
        target: models.ClientVsGroup,
        options: {
            as: 'vs_clients',
            foreignKey: {
                name: 'group_id',
                allowNull: false,
            },
        },
    },
];
