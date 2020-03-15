import { ConnectionManager } from "@luodexun/database-manager";
import { Container, Database, Logger } from "@luodexun/interfaces";
import { defaults } from "./defaults";
import { PostgresConnection } from "./postgres-connection";

export const plugin: Container.IPluginDescriptor = {
    pkg: require("../package.json"),
    defaults,
    required: true,
    alias: "postgres",
    extends: "@luodexun/database-manager",
    async register(container: Container.IContainer, options) {
        container.resolvePlugin<Logger.ILogger>("logger").info("Establishing Database:postgres Connection");

        const connectionManager = container.resolvePlugin<ConnectionManager>("database-manager");

        return await connectionManager.createConnection(new PostgresConnection(options),'postgres');
    },
    async deregister(container: Container.IContainer, options) {
        container.resolvePlugin<Logger.ILogger>("logger").info("Closing Database:postgres Connection");

        await container.resolvePlugin<Database.IConnection>("postgres").disconnect();
    },
};
