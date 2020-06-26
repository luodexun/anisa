import Boom from "@hapi/boom";
import Hapi from "@hapi/hapi";
import {app} from "@luodexun/container";
import {Database} from "@luodexun/interfaces";
const  mssql = app.resolvePlugin<Database.IConnection>("mssql");
export class BlockchainController {
    public async index(request: Hapi.Request|any, h: Hapi.ResponseToolkit) {
        try {
            const kk = request.i18n.__("MESSAGE");
            console.log(request.yar.get("example"));
            request.yar.set("example", { key: kk });
            const {data, sum} = await request.server.methods.information(request);
            const { recordset } = await mssql.query.any("select * from ow_member");
            console.log(recordset);
            return h.response({results: data, totalCount: sum.count});
        } catch (err) {
            console.log(err);
            return Boom.badImplementation("terrible implementation");
        }
    }

    public async search(request: Hapi.Request|any, h: Hapi.ResponseToolkit) {
        try {
            const kk = request.i18n.__("MESSAGE");
            console.log(request.yar.get("example"));
            request.yar.set("example", { key: kk });
            const { data, sum} = await request.server.methods.search(request);
            return h.response({results: data, totalCount: sum.count});
        } catch (err) {
            console.log(err);
            return Boom.badImplementation("terrible implementation");
        }
    }
}
