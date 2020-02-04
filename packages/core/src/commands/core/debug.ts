import { Command, flags } from "@oclif/command";

export default class CoreDebug extends Command {
  public static description = "describe the command here";

  public static flags = {
    help: flags.help({ char: "h" }),
    // flag with a value (-n, --name=VALUE)
    name: flags.string({ char: "n", description: "name to print" }),
    // flag with no value (-f, --force)
    force: flags.boolean({ char: "f" })
  };

  public static args = [{ name: "file" }];

  public async run() {
    const { args, flags } = this.parse(CoreDebug);

    const name = flags.name || "world";
    this.log(
      `hello ${name} from /Users/luodexun/Desktop/anisa/packages/core/src/commands/core/debug.ts`
    );
    if (args.file && flags.force) {
      this.log(`you input --force and --file: ${args.file}`);
    }
  }
}
