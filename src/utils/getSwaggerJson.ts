import { readdirSync } from 'node:fs';
import {
    basename,
    extname,
    join,
    sep,
} from 'node:path';
import {
    OpenAPIRegistry,
    OpenApiGeneratorV31,
    RouteConfig,
    extendZodWithOpenApi,
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import getModels from './getModels.js';

extendZodWithOpenApi(z);

const types: {
    [ dbType: string ]: string,
} = {
    VARCHAR: 'string',
    TINYINT: 'boolean',
    DATETIME: 'string',
    DATE: 'string',
    NVARCHAR2: 'string',
    'TIMESTAMP WITH LOCAL TIME ZONE': 'string',
};

const formats: {
    [ dbType: string ]: string,
} = {
    DATETIME: 'date-time',
    DATE: 'date-time',
    'TIMESTAMP WITH LOCAL TIME ZONE': 'date-time',
};

const removeParentheses = (string: string) => {
    const index = string.indexOf('(');
    return string.substring(0, index > -1 ? index : Infinity);
};

const paths: {
    [ path: string]: {
        [ method: string ]: {
            requestBody?: {
                content: {
                    [contentType: string]: {
                        schema?: object,
                    }
                }
            },
            tags?: string[],
            security?: object[],
            responses: {
                [ status: string ]: object,
            },
        },
    },
} = {};

const pathControllers = `${join(__dirname, '..', 'controllers')}${sep}`;

const registerPath = async (dir: string, registry: OpenAPIRegistry) => {
    const promises: Promise<void>[] = [];

    readdirSync(
        dir,
        { withFileTypes: true },
    ).forEach((valueFile) => {
        const pathFile = join(dir, valueFile.name);
        const extension = extname(valueFile.name);

        if (valueFile.isDirectory()) {
            promises.push(registerPath(pathFile, registry));
        } else if (true
            && valueFile.isFile()
            && (false
                || extension === '.js'
                || (true
                    && process.env.NODE_ENV !== 'production'
                    && extension === '.ts'
                )
            )
        ) {
            const pathName = `/${dir.replace(pathControllers, '').replace(/\\/g, '/')}`;
            const method = basename(valueFile.name, extname(valueFile.name));

            if (!(pathName in paths)) {
                paths[pathName] = {};
            }

            promises.push(import(`file://${pathFile}`).then((valueController) => {
                let routeConfig: RouteConfig = {
                    method: 'get',
                    path: pathName,
                    request: {},
                    responses: {},
                };

                if (false
                    || method === 'get'
                    || method === 'post'
                    || method === 'patch'
                    || method === 'put'
                    || method === 'delete'
                    || method === 'head'
                    || method === 'options'
                    || method === 'trace'
                ) {
                    routeConfig.method = method;
                }

                if ('DOCS' in valueController) {
                    routeConfig = {
                        ...routeConfig,
                        ...valueController.DOCS,
                    };
                }

                if (routeConfig.request) {
                    if ('HEADERS_SCHEMA' in valueController) {
                        routeConfig.request.headers = valueController.HEADERS_SCHEMA;
                    }

                    if ('PARAMS_SCHEMA' in valueController) {
                        routeConfig.request.params = valueController.PARAMS_SCHEMA;
                    }

                    if ('BODY_OR_QUERY_SCHEMA' in valueController) {
                        if (method === 'get') {
                            routeConfig.request.query = valueController.BODY_OR_QUERY_SCHEMA;
                        } else if (routeConfig.request) {
                            routeConfig.request.body = {
                                content: {
                                    'application/json': { schema: valueController.BODY_OR_QUERY_SCHEMA },
                                },
                            };
                        }
                    }
                }

                routeConfig.tags = [pathName.split('/')[1]];

                if (false
                    || pathName !== '/auth'
                    || method !== 'post'
                ) {
                    routeConfig.security = [{ bearerAuth: [] }];
                }

                registry.registerPath(routeConfig);
            }));
        }
    });

    await Promise.all(promises);
};

export default async () => {
    const registry = new OpenAPIRegistry();
    await registerPath(pathControllers, registry);

    const schemas: {
        [model: string]: object,
    } = {
        Error: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                cause: { type: 'string' },
                message: { type: 'string' },
                stack: { type: 'string' },
            },
            required: ['name', 'message', 'stack'],
        },
    };

    const models = await getModels();

    models.forEach((valueModels) => {
        const required: string[] = [];
        const properties: {
            [ attribute: string ]: {
                type?: string,
                format?: string,
                $ref?: string,
                items?: object,
                readOnly?: boolean,
            },
        } = {};

        const attributes = valueModels.module.default.getAttributes();

        Object.keys(attributes).forEach((keyAttributes) => {
            const valueAttributes = attributes[keyAttributes];

            properties[keyAttributes] = {};

            if (!valueAttributes.allowNull) {
                required.push(keyAttributes);
            }

            try {
                const dbType = removeParentheses(valueAttributes.type.toString({}));
                properties[keyAttributes].type = types[dbType] ?? dbType.toLowerCase();
                properties[keyAttributes].format = formats[dbType];
            } catch (err) { /* empty */ }
        });

        const { associations } = valueModels.module.default;

        Object.keys(associations).forEach((keyAssociations) => {
            const valueAssociations = associations[keyAssociations];

            if (['BelongsTo', 'HasOne '].includes(valueAssociations.associationType)) {
                properties[keyAssociations] = { $ref: `#/components/schemas/${valueAssociations.target.name}` };
            } else if (['HasMany', 'BelongsToMany'].includes(valueAssociations.associationType)) {
                properties[keyAssociations] = {
                    readOnly: true,
                    type: 'array',
                    items: { $ref: `#/components/schemas/${valueAssociations.target.name}` },
                };
            }
        });

        schemas[valueModels.module.default.name] = {
            type: 'object',
            properties,
            required,
        };
    });

    registry.registerComponent(
        'securitySchemes',
        'bearerAuth',
        {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
        },
    );

    const swaggerJson = JSON.parse(JSON.stringify(
        new OpenApiGeneratorV31(registry.definitions.sort((a, b) => {
            if (true
                && a.type === 'route'
                && b.type === 'route'
            ) {
                if (a.route.path < b.route.path) return -1;
                if (a.route.path > b.route.path) return 1;
            }

            return 0;
        })).generateDocument({
            openapi: '3.0.2',
            info: {
                version: '1.0.0',
                title: 'Título para a documentação da API',
            },
        }),
    ));

    swaggerJson.components.schemas = schemas;
    return swaggerJson;
};
