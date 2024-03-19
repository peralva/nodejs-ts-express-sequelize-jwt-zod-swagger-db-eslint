type Config = {
    defaultLimit: number,
    sessionTimeInMinutes?: number,
};

const config: {
    [ environment: string ]: Config,
} = {
    development: {
        defaultLimit: 50,
        sessionTimeInMinutes: 60,
    },
};

// eslint-disable-next-line import/no-mutable-exports
let result: Config;

if (process.env.NODE_ENV) {
    result = config[process.env.NODE_ENV];
} else {
    result = { defaultLimit: 50 };
}

export default result;
