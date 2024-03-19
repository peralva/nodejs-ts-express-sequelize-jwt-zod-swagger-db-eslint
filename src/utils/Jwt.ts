import jsonwebtoken from 'jsonwebtoken';
import config from '../config.js';

const options: {
    expiresIn?: number;
} = {};

if (typeof config.sessionTimeInMinutes === 'number') {
    options.expiresIn = config.sessionTimeInMinutes * 60;
}

export default class {
    static tokenToPayload = (token: string) => {
        let result;
        if (process.env.JWT_SECRET) result = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        if (typeof result === 'object') return result;
        return {};
    };

    static generateToken = (payload: object) => jsonwebtoken.sign(
        payload,
        process.env.JWT_SECRET ?? '',
        options,
    );
}
