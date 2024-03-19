import { Model } from 'sequelize';
import { models } from './index.js';

export default class ClientVsGroup extends Model {}

export const OPTIONS = {
    tableName: 'clients_vs_groups',
    modelName: 'client_vs_group',
    indexes: [{
        unique: true,
        fields: [
            'client_id',
            'group_id',
        ],
    }],
};

export const ASSOCIATIONS = () => [
    {
        association: 'belongsTo',
        target: models.Client,
        options: {
            as: 'client',
            foreignKey: {
                name: 'group_id',
                allowNull: false,
            },
        },
    },
    {
        association: 'belongsTo',
        target: models.Group,
        options: {
            as: 'group',
            foreignKey: {
                name: 'client_id',
                allowNull: false,
            },
        },
    },
];
