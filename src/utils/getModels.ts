/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-param-reassign */

import { readdirSync } from 'fs';
import { basename, extname, join } from 'path';
import {
    BelongsToManyOptions,
    BelongsToOptions,
    DataTypes,
    HasManyOptions,
    HasOneOptions,
    Model,
    ModelAttributes,
    ModelStatic,
    Optional,
} from 'sequelize';

export type Association = {
    association: 'belongsTo' | 'belongsToMany' | 'hasOne' | 'hasMany',
    target: ModelStatic<Model<any, any>>,
    options: BelongsToOptions | BelongsToManyOptions | HasOneOptions | HasManyOptions,
}

const files = readdirSync(
    join(__dirname, '../models'),
    { withFileTypes: true },
).filter((valueFiles) => {
    if (valueFiles.isFile()) {
        const extension = extname(valueFiles.name);

        return (true
            && basename(valueFiles.name, extension) !== 'index'
            && (false
                || extension === '.js'
                || (true
                    && process.env.NODE_ENV !== 'production'
                    && extension === '.ts'
                )
            )
        );
    }

    return false;
}).sort((a, b) => {
    if (basename(a.name, extname(a.name)) === 'User') return -1;
    if (basename(b.name, extname(b.name)) !== 'User') return 1;
    return 0;
});

const promises: Promise<void>[] = [];
const models: {
    name: string,
    module: {
        default: ModelStatic<Model<any, any>>,
        OPTIONS: object,
        ATTRIBUTES: ModelAttributes<Model, Optional<any, never>>,
        ASSOCIATIONS: () => Association[],
    },
}[] = [];

files.forEach((valueModels) => {
    promises.push(import(`file://${join(
        valueModels.path,
        valueModels.name,
    )}`).then((valueImport) => {
        const modelName = basename(valueModels.name, extname(valueModels.name));

        valueImport = valueImport.default;

        if (valueImport.ATTRIBUTES) {
            if (false
                || typeof valueImport.ATTRIBUTES !== 'object'
                || valueImport.ATTRIBUTES === null
            ) {
                throw new Error(`A constante 'ATTRIBUTES' do modelo '${modelName}' precisa ser um objeto. Valor informado: ${JSON.stringify(valueImport.ATTRIBUTES)}`);
            }
        } else {
            valueImport.ATTRIBUTES = {};
        }

        if (!valueImport.ATTRIBUTES.id) {
            valueImport.ATTRIBUTES.id = {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true,
            };
        }

        if (valueImport.OPTIONS) {
            if (false
                || typeof valueImport.OPTIONS !== 'object'
                || valueImport.OPTIONS === null
            ) {
                throw new Error(`A constante 'OPTIONS' do modelo '${modelName}' precisa ser um objeto. Valor informado: ${JSON.stringify(valueImport.OPTIONS)}`);
            }
        } else {
            valueImport.OPTIONS = {};
        }

        if (false
            || typeof valueImport.default !== 'function'
            || !(valueImport.default.prototype instanceof Model)
        ) {
            throw new Error(`O modelo '${modelName}' precisa extender de 'Sequelize.Model'. Valor informado: ${JSON.stringify(valueImport.default)}`);
        }

        if (valueImport.ASSOCIATIONS) {
            if (typeof valueImport.ASSOCIATIONS !== 'function') {
                throw new Error(`A constante 'ASSOCIATIONS' do modelo '${modelName}' precisa ser uma função. Valor informado: ${JSON.stringify(valueImport.ASSOCIATIONS)}`);
            }
        } else {
            valueImport.ASSOCIATIONS = () => [];
        }

        models.push({
            name: modelName,
            module: valueImport,
        });
    }));
});

export default async () => {
    await Promise.all(promises);
    return models;
};
