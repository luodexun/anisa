import { ConnectionManager } from "@luodexun/database-manager";
import { Container, Database, Logger } from "@luodexun/interfaces";
import { defaults } from "./defaults";
import { MysqlConnection } from "./mysql-connection";

export const plugin: Container.IPluginDescriptor = {
    pkg: require("../package.json"),
    defaults,
    required: true,
    alias: "mysql",
    extends: "@luodexun/database-manager",
    async register(container: Container.IContainer, options) {
        container.resolvePlugin<Logger.ILogger>("logger").info("Establishing Database:mysql Connection");
        const connectionManager = container.resolvePlugin<ConnectionManager>("database-manager");

        return await connectionManager.createConnection(new MysqlConnection(options), "mysql");
    },
    async deregister(container: Container.IContainer, options) {
        container.resolvePlugin<Logger.ILogger>("logger").info("Closing Database:mysql Connection");

        await container.resolvePlugin<Database.IConnection>("mysql").disconnect();
    },
};
