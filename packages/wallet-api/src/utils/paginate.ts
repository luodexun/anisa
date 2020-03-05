import Hapi from "@hapi/hapi";
export const paginateServer = (request: Hapi.Request): any => {
    const pagination = {
        // @ts-ignore
        offset: (request.query.page - 1) * request.query.limit || 0,
        // @ts-ignore
        limit: request.query.limit || 100,
    };

    // @ts-ignore
    if (request.query.offset) {
        // @ts-ignore
        pagination.offset = request.query.offset;
    }

    return pagination;

};
