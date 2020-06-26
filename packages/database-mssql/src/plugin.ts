import { ConnectionManager } from "@luodexun/database-manager";
import { Container, Database, Logger } from "@luodexun/interfaces";
import { config } from "mssql";
import { defaults } from "./defaults";
import { MysqlConnection } from "./mysql-connection";
export const plugin: Container.IPluginDescriptor = {
    pkg: require("../package.json"),
    defaults,
    required: true,
    alias: "mssql",
    extends: "@luodexun/database-manager",
    async register(container: Container.IContainer, options) {
        container.resolvePlugin<Logger.ILogger>("logger").info("Establishing Database:mssql Connection");
        const connectionManager = container.resolvePlugin<ConnectionManager>("database-manager");
        const config: config = {
            user: options.user as string,
            password: options.password as string,
            server: options.server as string, // You can use 'localhost\\instance' to connect to named instance
            database: options.database as string,
            port: options.port as number,
            pool: {
                max: 10,
                min: 0,
                idleTimeoutMillis: 30000,
            },
            options: {
                encrypt: false,
                enableArithAbort: true,
            },
         };
        return await connectionManager.createConnection(new MysqlConnection(config), "mssql");
    },
    async deregister(container: Container.IContainer, options) {
        container.resolvePlugin<Logger.ILogger>("logger").info("Closing Database:mssql Connection");

        await container.resolvePlugin<Database.IConnection>("mssql").disconnect();
    },
};
