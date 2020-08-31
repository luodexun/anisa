import { app } from "@luodexun/container";
import { Logger, P2P } from "@luodexun/interfaces";
import http from "http";
import { AGServer, attach } from "socketcluster-server";
// import * as handlers from "./versions";

export const startSocketServer = async (service: P2P.IPeerService, config: Record<string, any>): Promise<any> => {
    const server: AGServer = attach (http.createServer(), config.server);
    (async () => {
        for await (const {socket} of server.listener('connection')) {

            (async () => {
                // Set up a loop to handle and respond to RPCs.
                for await (const request of socket.procedure("customProc")) {
                    if (request.data && request.data.bad) {
                        const badCustomError = new Error("Server failed to execute the procedure");
                        badCustomError.name = "BadCustomError";
                        request.error(badCustomError);

                        continue;
                    }
                    console.log(request.data);
                    request.end('Success');
                }
            })();

        }
    })();
    server.listener("error").once().then(data => app.resolvePlugin<Logger.ILogger>("logger").error(data.error));

    const serverReadyPromise = await new Promise(resolve => resolve(server));

    return serverReadyPromise;
};
