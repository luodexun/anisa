
import { ServerCache } from "../../services";
import { paginateServer } from "../../utils"


const information = async request => {
    const pool = request.mysql.pool;
    let {limit, page} = request.query;
    let [data] = await pool.query(`select a.id,a.cate,a.title,a.icon,a.desc,a.view_count,a.star_count,a.share_count from w_information as a limit ${(page-1)*limit},${limit};`);
    let [[ sum ]] = await pool.query('select count(*) as count from w_information');
    return { data, sum}
}

const search = async request => {
    const pool = request.mysql.pool;
    let {limit, page} = request.query;
    let [data] = await pool.query(`select * from w_information limit ${(page-1)*limit},${limit};`);
    let [[ sum ]] = await pool.query('select count(*) as count from w_information');
    return { data, sum}
}

export const registerMethods = server => {
    ServerCache.make(server)
        .method("information", information, 6, request => ({
            ...paginateServer(request)
        })).method("search", search, 6, request => ({
        ...paginateServer(request)
    }));
};
