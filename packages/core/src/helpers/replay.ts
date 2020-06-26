import { app } from "@luodexun/container";
import { Container } from "@luodexun/interfaces";

// tslint:disable-next-line:no-var-requires
const { version } = require("../../package.json");

export const setUpLite = async (options): Promise<Container.IContainer> => {
    await app.setUp(version, options, {
        options: {
            "@arkecosystem/core-blockchain": { replay: true },
        },
        include: [
            "@arkecosystem/core-event-emitter",
            "@arkecosystem/core-logger-pino",
            "@arkecosystem/core-state",
            "@arkecosystem/core-database-postgres",
            "@arkecosystem/core-blockchain",
        ],
    });

    return app;
};
