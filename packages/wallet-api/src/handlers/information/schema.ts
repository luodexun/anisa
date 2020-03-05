import Joi from "@hapi/joi";

export const paginationDefine: object = {
    query: Joi.object({
        limit: Joi.number().integer().min(1)
            .description('每页的条目数'),
        page: Joi.number().integer().min(1)
            .description('页码数'),
        pagination: Joi.boolean().description('是否开启分页，默认为true')
    }),
};
