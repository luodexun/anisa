import { MysqlConnection } from "../mysql-connection";

export class QueryExecutor {
    constructor(private readonly connection: MysqlConnection) {}

    public async any<T = any>(query: string ): Promise<T> {
        return new Promise<T>(
            (resolve, reject) => {
                this.connection.db.query(query, (error, recordset) => {
                    if (error) {
                        reject(error);
                    }
                    resolve(recordset as any);
                });
            });
         }
}
