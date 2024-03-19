import { Response } from 'express';

export default (res: Response, token?: string) => {
    if (token) {
        res.cookie(
            'token',
            token,
            { httpOnly: true },
        );

        res.setHeader('Token', token);
    } else {
        res.clearCookie('token');
    }
};
