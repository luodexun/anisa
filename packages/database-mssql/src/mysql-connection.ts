import { app } from "@luodexun/container";
import { Database, Logger } from "@luodexun/interfaces";
import mssql, {config, ConnectionPool} from "mssql";
import { QueryExecutor } from "./sql/query-executor";
export class MysqlConnection  implements Database.IConnection {
    public query: QueryExecutor;
    public db: ConnectionPool;
    private readonly logger: Logger.ILogger = app.resolvePlugin<Logger.ILogger>("logger");
    private cache: Map<any, any>;

    public constructor(readonly options: config) {}

    public async make(): Promise<any> {
        if (this.db) {
            throw new Error("Database connection already initialised");
        }

        this.logger.debug("Connecting to database");

        this.cache = new Map();
        this.db = new mssql.ConnectionPool(this.options);
        try {
            await this.connect();
            this.registerQueryExecutor();
            this.logger.info(`Connected to database:${this.options.server}:${this.options.port}`);
            return this;
        } catch (error) {
            app.forceExit("Unable to connect to the database!", error);
        }

        return undefined;
    }

    public async connect(): Promise<void> {
        this.db.connect((error) => {
            if (error) {
                app.forceExit("Unable to connect to the database!", error);
            }
        });

    }

    public async disconnect(): Promise<void> {
        this.logger.debug("Disconnecting from database");
        try {
            this.cache.clear();
        } catch (error) {
            this.logger.warn("Issue in commiting blocks, database might be corrupted");
            this.logger.warn(error.message);
        }
        this.db.close();
        this.logger.debug("Disconnected from database");
    }

    private registerQueryExecutor(): void {
        this.query = new QueryExecutor(this);
    }
}
