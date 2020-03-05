import Hapi from "@hapi/hapi";
import * as Information from "./information";

export = {
    async register(server: Hapi.Server): Promise<void> {
        const modules = [Information];

        for (const module of modules) {
            module.register(server);
        }
    },
    name: "Public API",
    version: "2.0.0",
};
