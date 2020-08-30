import { app } from "@luodexun/container";
import { Database } from "@luodexun/interfaces";
import { ServerCache } from "../../services";
import { paginateServer } from "../../utils";
const  database = app.resolvePlugin<Database.IConnection>("mysql");
const  mssql = app.resolvePlugin<Database.IConnection>("mssql");
const information = async (request) => {
    const {limit, page} = request.query;
    const data = await database.query.any(`select * from cs_frame_outside as a limit ${(page - 1) * limit},${limit};`);
    const [sum] = await database.query.any(`select count(*) as count from cs_frame_outside;`);
    return {data, sum};
};

const search = async (request) => {
    const {limit, page} = request.query;
    const { recordset: data } = await mssql.query.any(`select * from ow_member limit ${(page - 1) * limit},${limit};`);
    const {recordset : [{ count }]} = await mssql.query.any("select count(*) as count from ow_member");
    console.log(data); console.log(count);
    return {data, count};
};

export const registerMethods = (server) => {
    ServerCache.make(server)
        .method("information", information, 6, (request) => ({
            ...paginateServer(request),
        })).method("search", search, 6, (request) => ({
        ...paginateServer(request),
    }));
};
