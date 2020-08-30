import { Crypto } from "@arkecosystem/crypto";
import Hapi, { ServerMethod } from "@hapi/hapi";
import * as _ from "lodash";
export class ServerCache {
    public static make(server: Hapi.Server): ServerCache {
        return new ServerCache(server);
    }

    private constructor(readonly server: Hapi.Server) {}

    public method(name: string, method: ServerMethod, expiresIn: number, argsCallback?: any): this {
        let options = {};
        // @ts-ignore
        // @ts-ignore
        if (!_.isEmpty(this.server.app.config.cache)) {
            options = {
                cache: {
                    cache: "redisCache",
                    expiresIn: expiresIn * 1000,
                    generateTimeout: 100,
                },
                generateKey: (request) => this.generateCacheKey(argsCallback(request)),
            };
        }
        this.server.method(name, method, options);

        return this;
    }

    private generateCacheKey(value: object): string {
        return Crypto.HashAlgorithms.sha256(JSON.stringify(value)).toString("hex");
    }
}
