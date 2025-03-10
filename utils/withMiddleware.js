// utils/withMiddleware.js

export function withMiddleware(middleware) {
    return async (req, res) => {
        return new Promise((resolve, reject) => {
            middleware(req, res, (result) => {
                if (result instanceof Error) {
                    return reject(result);
                }
                return resolve(result);
            });
        });
    };
}
