import {app} from "@luodexun/container";
import {Logger, P2P} from "@luodexun/interfaces";
import eetase from "eetase";
import http from "http";
import {AGServer, attach} from "socketcluster-server";
// import * as handlers from "./versions";

export const startSocketServer = async (service: P2P.IPeerService, config: Record<string, any>): Promise<any> => {
    const httpServer = eetase(http.createServer());
    const server: AGServer = attach (httpServer);
    (async () => {
        for await (const { socket } of server.listener('connection')) {
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
        for await (const { error } of server.listener('error')) {
            app.resolvePlugin<Logger.ILogger>("logger").error(error.message);
        }
    })();
    server.setMiddleware("inbound", async (stream) => {
        for await (let action of stream) {
            if (action.type === action.TRANSMIT) {
                console.log(action.receiver);
                if (!action.data) {
                    let error = new Error(
                        'Transmit action must have a data object',
                    );
                    error.name = 'InvalidActionError';
                    action.block(error);
                    continue;
                }
            } else if (action.type === action.INVOKE) {
                console.log(action.procedure);
                if (!action.data) {
                    let error = new Error(
                        'Invoke action must have a data object',
                    );
                    error.name = 'InvalidActionError';
                    action.block(error);
                    continue;
                }
            }
            action.allow();
        }
    });
    httpServer.listen(config.server.port);
    app.resolvePlugin<Logger.ILogger>("logger").info(`p2p with PID ${process.pid} is listening on port ${config.server.port}`);
    return await new Promise(resolve => resolve(server));
};
