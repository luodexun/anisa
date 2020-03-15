import {Command, flags} from '@oclif/command';
import { ConnectionManager } from "@luodexun/database-manager";
import { PostgresConnection } from "@luodexun/database-postgres";
export default class CoreDebug extends Command {
  static description = 'describe the command here';

  static flags = {
    help: flags.help({char: 'h'}),
    // flag with a value (-n, --name=VALUE)
    name: flags.string({char: 'n', description: 'name to print'}),
    // flag with no value (-f, --force)
    force: flags.boolean({char: 'f'}),
  }

  static args = [{name: 'file'}]

  async run() {
    // @ts-ignore
    const connection = await new ConnectionManager().createConnection(new PostgresConnection({
      initialization: {
        capSQL: true,
        promiseLib: require("bluebird"),
        noLocking: true,
      },
      connection: {
        host: "localhost",
        port: 5432,
        database: "test",
        user: "postgres",
        password:"123456",
      },
      estimateTotalCount: false,
    }));
  }
}
