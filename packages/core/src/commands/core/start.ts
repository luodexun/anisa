import { flags } from "@oclif/command";
import { CommandFlags } from "../../types";
import { BaseCommand } from "../command";

export default class CoreStart extends BaseCommand  {
  public static description = 'test start';

  public static examples: string[] = [
    `Run core
$ ark core:run
`,
    `Run core as genesis
$ ark core:run --networkStart
`,
    `Disable any discovery by other peers
$ ark core:run --disableDiscovery
`,
    `Skip the initial discovery
$ ark core:run --skipDiscovery
`,
    `Ignore the minimum network reach
$ ark core:run --ignoreMinimumNetworkReach
`,
    `Start a seed
$ ark core:run --launchMode=seed
`,
  ];

  public static flags: CommandFlags = {
    ...BaseCommand.flagsNetwork,
    ...BaseCommand.flagsBehaviour,
    ...BaseCommand.flagsForger,
    suffix: flags.string({
      hidden: true,
      default: "core",
    }),
    env: flags.string({
      default: "production",
    }),
  };

  static args = [{name: 'file'}]

  async run() {
    const { flags } = await this.parseWithNetwork(CoreStart);
    console.log(flags);console.log(process.env.CORE_ENV);
    this.log(`you input --force and --file: ${flags}`)
  }
}
