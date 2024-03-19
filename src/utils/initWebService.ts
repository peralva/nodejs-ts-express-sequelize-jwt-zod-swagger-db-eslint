import { join } from 'node:path';
import { existsSync, readdirSync } from 'node:fs';
import http from 'node:http';
import express, { Application, Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { ZodError, z } from 'zod';
import swaggerUiExpress from 'swagger-ui-express';
import ServiceUnavailableError from './HttpError/ServiceUnavailableError.js';
import getCookie from './getCookie.js';
import UnauthorizedError from './HttpError/UnauthorizedError.js';
import Jwt from './Jwt.js';
import defineResponseToken from './defineResponseToken.js';
import getDataCached from './getDataCached.js';
import validateUser from './validateUser.js';
import User from '../models/User.js';
import config from '../config.js';
import NotFoundError from './HttpError/NotFoundError.js';
import MethodNotAllowedError from './HttpError/MethodNotAllowedError.js';
import HttpError from './HttpError/index.js';
import shutdown from '../index.js';
import getSwaggerJson from './getSwaggerJson.js';

const PATH_DYNAMIC_ROUTERS = join(__dirname, '..', 'controllers');
const REGEX_PATH_PARAMS = /{(.*?)}/g;

const getPathParams = (dir: string) => {
    const result: string[] = [];

    readdirSync(
        dir,
        { withFileTypes: true },
    ).forEach((value) => {
        if (value.isDirectory()) {
            result.push(...getPathParams(`${dir}/${value.name}`));

            const pathParam = `${dir.replace(PATH_DYNAMIC_ROUTERS, '')}/${value.name}`;

            const regex = new RegExp(REGEX_PATH_PARAMS);

            if (regex.exec(pathParam)) {
                result.push(pathParam);
            }
        }
    });

    return result;
};

const pathParams = getPathParams(PATH_DYNAMIC_ROUTERS);

const middlewareShutdownSum = () => {
    if (shutdown.enabled) {
        throw new ServiceUnavailableError('Serviço está sendo desligado...');
    } else {
        shutdown.running += 1;
    }

    return !shutdown.enabled;
};

const middlewareGetBody: (req: Request) => Promise<string> = (req) => new Promise((resolve) => {
    let body = '';

    req.on(
        'data',
        (chunk) => {
            body += chunk;
        },
    );

    req.on(
        'end',
        () => {
            resolve(body);
        },
    );
});

const middlewareBodyToJSON = (body: string) => {
    let result;

    try {
        result = JSON.parse(body);
    } catch (err) {
        result = body;
    }

    return result;
};

const middlewareValidateToken = (req: Request, res: Response) => {
    const cookie = getCookie(req.headers.cookie);

    let token: string;

    if (true
        && 'authorization' in req.headers
        && typeof req.headers.authorization === 'string'
    ) {
        const authorization = req.headers.authorization.split(' ');

        if (authorization[0] !== 'Bearer') {
            throw new UnauthorizedError('Token inválido');
        }

        [, token] = authorization;
    } else if ('token' in cookie) {
        token = cookie.token;
    } else {
        throw new UnauthorizedError('Nenhum token foi informado');
    }

    let payload;

    try {
        payload = Jwt.tokenToPayload(token);
        token = Jwt.generateToken({ user_id: payload.user_id });
    } catch (err: unknown) {
        if (true
            && typeof err === 'object'
            && err !== null
            && 'stack' in err
            && typeof err.stack === 'string'
        ) {
            throw new UnauthorizedError(err.stack);
        }
    }

    defineResponseToken(res, token);
    return payload;
};

const middlewareValidateUser = async (payload: JwtPayload) => z.custom<User>().parse(
    await getDataCached(
        async () => await validateUser(payload.user_id),
        {
            cachedTime: 1000 * 60 * 10,
            alias: {
                __filename,
                function: 'validateUser',
            },
        },
    ),
);

const middlewareGetPathParams = (req: Request) => {
    const pathController = join(`${PATH_DYNAMIC_ROUTERS}${req.path.toLowerCase()}`, `${req.method.toLowerCase()}.js`);

    const urlPath = req.url.toLowerCase().split('/');

    if (!existsSync(pathController)) {
        pathParams.some((valuePathParams) => {
            const pathParam = valuePathParams.split('/');

            return (true
                && pathParam.length === urlPath.length
                && pathParam.every((valuePathParam, index) => {
                    if (true
                        && valuePathParam.substring(0, 1) === '{'
                        && valuePathParam.substring(valuePathParam.length - 1) === '}'
                    ) {
                        req.params[valuePathParam.substring(1, valuePathParam.length - 1)] = (
                            urlPath[index]
                        );

                        urlPath[index] = valuePathParam;

                        return true;
                    }

                    return valuePathParam === urlPath[index];
                })
            );
        });
    }

    return urlPath.join('/');
};

const middlewareGetLimitAndOffset = (req: Request) => {
    const customHeaders = z.object({
        limit: z.preprocess(
            (arg) => {
                if (arg) {
                    return Number(arg);
                }

                return config.defaultLimit;
            },
            z.number().int().min(1),
        ),
        offset: z.preprocess(
            (arg) => {
                if (!arg) {
                    return 0;
                }

                return Number(arg);
            },
            z.number().int().min(0),
        ),
    }).parse(req.headers);

    return {
        limit: customHeaders.limit,
        offset: customHeaders.offset,
    };
};

const middlewareRouters = async (
    req: Request,
    res: Response,
    requestBody: unknown,
    offset: number,
    limit: number,
    user?: User,
) => {
    const pathFolder = `${PATH_DYNAMIC_ROUTERS}${req.path.toLowerCase()}`;
    const pathController = join(pathFolder, `${req.method.toLowerCase()}.js`);

    if (!existsSync(pathFolder)) {
        throw new NotFoundError(`Rota (${req.path}) não encontrada`);
    }

    if (!existsSync(pathController)) {
        throw new MethodNotAllowedError(`Método (${req.method}) não permitido`);
    }

    let controller = await import(`file://${pathController}`);
    controller = controller.default;

    let headers;
    let params;
    let query;
    let body;

    if ('HEADERS_SCHEMA' in controller) {
        headers = controller.HEADERS_SCHEMA.parse(req.headers);
    }

    if ('PARAMS_SCHEMA' in controller) {
        params = controller.PARAMS_SCHEMA.parse(req.params);
    }

    if ('BODY_OR_QUERY_SCHEMA' in controller) {
        if (req.method === 'GET') {
            query = controller.BODY_OR_QUERY_SCHEMA.parse(req.query);
        } else {
            body = controller.BODY_OR_QUERY_SCHEMA.parse(requestBody);
        }
    }

    const responseBody: unknown = await controller.default({
        headers,
        params,
        query,
        body,
        offset: req.method === 'GET' ? offset : undefined,
        limit: req.method === 'GET' ? limit : undefined,
        user,
        res,
    });

    if (false
        || responseBody === undefined
        || req.method === 'HEAD'
    ) {
        res.status(204);
    } else if (req.method === 'POST') {
        res.status(201);
    } else {
        res.status(200);
    }

    return responseBody;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const middlewareErrors = (error: any, res: Response) => {
    let err: Error;

    if (error instanceof Error) {
        err = error;
    } else {
        err = new Error(`Uma exceção foi provocada sem passar a instância de Error: ${JSON.stringify(error)}`);
    }

    const result: { [ key: string ]: unknown } = {
        cause: err.cause,
        ...err,
        name: err.name,
        message: err.message,
        stack: err.stack,
    };

    let statusCode;

    if (err instanceof ZodError) {
        statusCode = 406;
    } else if (true
        && err instanceof HttpError
        && Number.isInteger(err.status)
        && err.status >= 400
        && err.status <= 599
    ) {
        statusCode = err.status;
    } else {
        statusCode = 500;
    }

    res.status(statusCode);

    return result;
};

const middlewareShutdownSubtract = (shutdownCountSubtract?: boolean) => {
    if (shutdownCountSubtract) {
        shutdown.running -= 1;
    }
};

const startServer = (app: Application) => {
    http.createServer(app).listen(
        Number(process.env.SERVICE_PORT),
        () => {
            // eslint-disable-next-line no-console
            console.info(new Date(), `Serviço iniciado.  Porta: ${process.env.SERVICE_PORT}  PID: ${process.pid}`);
        },
    );
};

export default async () => {
    const app = express();

    app.use(
        '/docs',
        swaggerUiExpress.serve,
        swaggerUiExpress.setup(await getSwaggerJson()),
    );

    app.use(async (req: Request, res: Response) => {
        let shutdownCountSubtract;
        let requestBody;
        let responseBody;
        let user;
        let offset;
        let limit;

        try {
            shutdownCountSubtract = middlewareShutdownSum();

            requestBody = await middlewareGetBody(req);
            requestBody = await middlewareBodyToJSON(requestBody);

            if (true
                && req.method !== 'OPTIONS'
                && (false
                    || req.method !== 'POST'
                    || req.path !== '/auth'
                )
            ) {
                try {
                    const jwtPayload = middlewareValidateToken(req, res);

                    if (jwtPayload) {
                        user = await middlewareValidateUser(jwtPayload);
                    }
                } catch (err) {
                    defineResponseToken(res);

                    if (false
                        || req.method !== 'POST'
                        || ![
                            '/auth',
                            '/user',
                        ].includes(req.path)
                    ) {
                        throw err;
                    }
                }
            }

            req.url = middlewareGetPathParams(req);

            const limitAndOffset = middlewareGetLimitAndOffset(req);
            offset = limitAndOffset.offset;
            limit = limitAndOffset.limit;

            if (req.method !== 'OPTIONS') {
                responseBody = await middlewareRouters(req, res, requestBody, offset, limit, user);

                if (typeof responseBody === 'number') {
                    responseBody = responseBody.toString();
                } else if (responseBody === null) {
                    if (req.method === 'GET') {
                        throw new NotFoundError('Registro não encontrado');
                    }
                }
            } else {
                res.status(200);
                responseBody = '';
            }
        } catch (err) {
            responseBody = middlewareErrors(err, res);
        }

        res.send(responseBody);

        middlewareShutdownSubtract(shutdownCountSubtract);
    });

    startServer(app);
};
