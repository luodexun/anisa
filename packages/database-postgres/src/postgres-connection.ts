import { app } from "@luodexun/container";
import { Database, Logger } from "@luodexun/interfaces";
import pgPromise, { IMain } from "pg-promise";
import { QueryExecutor } from "./sql/query-executor";
import { camelizeColumns } from "./utils";

export class PostgresConnection  implements Database.IConnection{
    // @TODO: make this private
    public query: QueryExecutor;
    // @TODO: make this private
    public db: any;
    public pgp: IMain;
    private readonly logger: Logger.ILogger = app.resolvePlugin<Logger.ILogger>("logger");
    private cache: Map<any, any>;

    public constructor(readonly options: Record<string,any>) {}

    public async make(): Promise<any> {
        if (this.db) {
            throw new Error("Database connection already initialised");
        }

        this.logger.debug("Connecting to database");

        this.cache = new Map();

        try {
            await this.connect();
            this.registerQueryExecutor();
            this.logger.info(`Connected to database:${this.options.connection.host}:${this.options.connection.port}`);
            return this;
        } catch (error) {
            app.forceExit("Unable to connect to the database!", error);
        }

        return undefined;
    }

    public async connect(): Promise<void> {

        const options = this.options;

        const pgp: pgPromise.IMain = pgPromise({
            ...options.initialization,
            ...{
                error: async (error, context) => {
                    // https://www.postgresql.org/docs/11/errcodes-appendix.html
                    // Class 53 — Insufficient Resources
                    // Class 57 — Operator Intervention
                    // Class 58 — System Error (errors external to PostgreSQL itself)
                    console.log(error);
                },
                receive(data) {
                    camelizeColumns(pgp, data);
                }
            },
        });

        this.pgp = pgp;
        this.db = this.pgp(this.options.connection);
    }

    public async disconnect(): Promise<void> {
        this.logger.debug("Disconnecting from database");


        try {
            this.cache.clear();
        } catch (error) {
            this.logger.warn("Issue in commiting blocks, database might be corrupted");
            this.logger.warn(error.message);
        }

        this.pgp.end();

        this.logger.debug("Disconnected from database");
    }



    private registerQueryExecutor(): void {
        this.query = new QueryExecutor(this);
    }

}
