import { flags } from "@oclif/command";
import { AbstractStopCommand } from "../../shared/stop";
import { CommandFlags } from "../../types";
import { BaseCommand } from "../command";

export class CoreStop extends AbstractStopCommand {
  public static description: string = "Stop the core";

  public static examples: string[] = [
    `Stop the core
$ anisa core:stop
`,
    `Stop the core daemon
$ anisa core:stop --daemon
`,
  ];

  public static flags: CommandFlags = {
    ...BaseCommand.flagsNetwork,
    daemon: flags.boolean({
      description: "stop the process or daemon",
    }),
  };

  public getClass() {
    return CoreStop;
  }

  public getSuffix(): string {
    return "core";
  }
}
