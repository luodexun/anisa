import {Hook} from '@oclif/config'
import { configManager } from "../../helpers/config";
const hook: Hook<'init'> = async function (opts) {
  configManager.setup(opts.config);

  if (opts.config.version.includes("next") && configManager.get("channel") !== "next") {
    configManager.set("channel", "next");
  }
};

export default hook
