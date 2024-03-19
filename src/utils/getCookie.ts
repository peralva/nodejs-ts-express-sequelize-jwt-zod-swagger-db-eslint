export default (cookie?: string) => {
    const result: {[ key: string ]: string } = {};

    if (typeof cookie === 'string') {
        const cookieArray = cookie.split('; ');

        cookieArray.forEach((value: string) => {
            const valueArray = value.split('=');

            [, result[valueArray[0]]] = valueArray;
        });
    }

    return result;
};
