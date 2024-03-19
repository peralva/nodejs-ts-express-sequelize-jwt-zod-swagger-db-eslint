/* eslint-disable no-param-reassign */
/* eslint-disable no-console */

import { Model, ModelStatic, Sequelize } from 'sequelize';
import { ValidationOptions } from 'sequelize/types/instance-validator';
import getModels, { Association } from '../utils/getModels.js';

interface CustomValidationOptions extends ValidationOptions {
    type: string,
}

export const models: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [ model: string ]: ModelStatic<Model<any, any>>
} = {};

export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: `database.${process.env.NODE_ENV}.sqlite`,
    define: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true,
    },
    logging: (
        process.env.SEQUELIZE_LOGGING === 'true'
            ? (sql: string) => {
                console.log(new Date(), sql);
            }
            : false
    ),
    hooks: {
        beforeValidate(instance, options: CustomValidationOptions) {
            let updatedById = instance.getDataValue('updated_by_id');
            const createdById = instance.getDataValue('created_by_id');

            if (true
                && updatedById !== undefined
                && (false
                    || typeof updatedById !== 'number'
                    || !Number.isInteger(updatedById)
                )
            ) {
                throw new Error(`O campo 'updated_by_id' precisa ser 'inteiro'. Valor informado: ${JSON.stringify(updatedById)}`);
            }

            if (createdById !== undefined) {
                throw new Error(`O campo 'created_by_id' não pode ser informado. Ele será preenchido automaticamente com base no campo 'updated_by_id' se o registro for inserido. Valor informado: ${JSON.stringify(createdById)}`);
            }

            if (updatedById === undefined) {
                updatedById = null;
                instance.setDataValue('updated_by_id', updatedById);

                if (options.skip) {
                    const index = options.skip.indexOf('updated_by_id');

                    if (index > -1) {
                        options.fields?.push(options.skip.splice(index, 1)[0]);
                    }
                }
            }

            if (options.type !== 'BULKUPDATE') {
                instance.setDataValue('created_by_id', updatedById);
            }
        },
        beforeBulkCreate(instances, options) {
            if (options.updateOnDuplicate) {
                const indexUpdatedAt = options.updateOnDuplicate.indexOf('updated_at');
                const indexUpdatedById = options.updateOnDuplicate.indexOf('updated_by_id');

                if (indexUpdatedAt === -1) options.updateOnDuplicate.push('updated_at');
                if (indexUpdatedById === -1) options.updateOnDuplicate.push('updated_by_id');
            }

            instances.forEach((value) => {
                let updatedById = value.getDataValue('updated_by_id');

                if (true
                    && updatedById !== undefined
                    && (false
                        || typeof updatedById !== 'number'
                        || !Number.isInteger(updatedById)
                    )
                ) {
                    throw new Error(`O campo 'updated_by_id' precisa ser 'inteiro'. Valor informado: ${JSON.stringify(updatedById)}`);
                }

                if (updatedById === undefined) {
                    updatedById = null;
                    value.setDataValue('updated_by_id', updatedById);
                }

                value.setDataValue('created_by_id', updatedById);
            });
        },
    },
});

export const initModels = async () => {
    const modelsArray = await getModels();

    modelsArray.forEach((valueModels) => {
        valueModels.module.default.init(
            valueModels.module.ATTRIBUTES,
            {
                sequelize,
                timestamps: true,
                ...valueModels.module.OPTIONS,
            },
        );

        models[valueModels.name] = valueModels.module.default;
    });

    modelsArray.forEach((valueModels) => {
        const associations = valueModels.module.ASSOCIATIONS();

        if (!Array.isArray(associations)) {
            throw new Error(`A constante 'ASSOCIATIONS' do modelo '${valueModels.name}' precisa retornar uma lista. Valor informado: ${JSON.stringify(associations)}`);
        }

        associations.push({
            association: 'belongsTo',
            target: models.User,
            options: {
                as: 'created_by',
                foreignKey: {
                    name: 'created_by_id',
                    allowNull: true,
                },
            },
        });

        associations.push({
            association: 'belongsTo',
            target: models.User,
            options: {
                as: 'updated_by',
                foreignKey: {
                    name: 'updated_by_id',
                    allowNull: true,
                },
            },
        });

        associations.forEach((valueAssociations: Association, index: number) => {
            if (false
                || typeof valueAssociations !== 'object'
                || valueAssociations === null
            ) {
                throw new Error(`A chave 'ASSOCIATIONS()[${index}]' do modelo '${valueModels.name}' precisa ser um objeto. Valor informado: ${JSON.stringify(valueAssociations)}`);
            }

            const ASSOCIATIONS = ['belongsTo', 'belongsToMany', 'hasOne', 'hasMany'];

            if (!ASSOCIATIONS.includes(valueAssociations.association)) {
                throw new Error(`A chave 'ASSOCIATIONS[${index}].association' do modelo '${valueModels.name}' precisa ser ${ASSOCIATIONS.join(', ')}. Valor informado: ${JSON.stringify(valueAssociations.association)}`);
            }

            if (false
                || typeof valueAssociations.target !== 'function'
                || !(valueAssociations.target.prototype instanceof Model)
            ) {
                throw new Error(`A chave 'ASSOCIATIONS[${index}].target' do modelo '${valueModels.name}' precisa ser um modelo. Valor informado: ${JSON.stringify(valueAssociations.target)}`);
            }

            if (valueAssociations.options) {
                if (false
                    || typeof valueAssociations.options !== 'object'
                    || valueAssociations.options === null
                ) {
                    throw new Error(`A chave 'ASSOCIATIONS[${index}].options' do modelo '${valueModels.name}' precisa ser objeto. Valor informado: ${JSON.stringify(valueAssociations.options)}`);
                }
            } else {
                valueAssociations.options = {};
            }

            if (!valueAssociations.options.onDelete) {
                valueAssociations.options.onDelete = 'NO ACTION';
            }
        });

        associations.forEach((valueAssociations) => {
            if (valueAssociations.association === 'belongsToMany') {
                if ('through' in valueAssociations.options) {
                    valueModels.module.default[valueAssociations.association](
                        valueAssociations.target,
                        valueAssociations.options,
                    );
                }
            } else {
                valueModels.module.default[valueAssociations.association](
                    valueAssociations.target,
                    valueAssociations.options,
                );
            }
        });
    });

    await sequelize.authenticate();
    await sequelize.sync();
};
