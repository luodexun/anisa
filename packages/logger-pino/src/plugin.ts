import { Container } from "@luodexun/interfaces";
import { LoggerManager } from "@luodexun/logger-manager";
import { defaults } from "./defaults";
import { PinoLogger } from "./driver";

export const plugin: Container.IPluginDescriptor = {
    pkg: require("../package.json"),
    defaults,
    required: true,
    alias: "logger",
    extends: "@luodexun/logger-manager",
    async register(container: Container.IContainer, options) {
        return container.resolvePlugin<LoggerManager>("log-manager").createDriver(new PinoLogger(options));
    },
};
