import { app } from "@luodexun/container";
import { EventEmitter, Logger, P2P } from "@luodexun/interfaces";
import { httpie } from "@luodexun/utils";
import dayjs from "dayjs";
import { AGClientSocket } from "socketcluster-client";
import { constants } from "./constants";
// import delay from "delay";
import { PeerStatusResponseError} from "./errors";
import { IPeerConfig, IPeerPingResponse } from "./interfaces";
import { isValidVersion, socketEmit} from "./utils";

export class PeerCommunicator implements P2P.IPeerCommunicator {
    private readonly logger: Logger.ILogger = app.resolvePlugin<Logger.ILogger>("logger");
    private readonly emitter: EventEmitter.EventEmitter = app.resolvePlugin<EventEmitter.EventEmitter>("event-emitter");

    constructor(private readonly connector: P2P.IPeerConnector) {
        console.log(123);
    }

    public async postBlock() {
        console.log(123);
    }

    public async postTransactions(peer: P2P.IPeer): Promise<any> {
        console.log(peer);
    }

    // ! do not rely on parameter timeoutMsec as guarantee that ping method will resolve within it !
    // ! peerVerifier.checkState can take more time !
    // TODO refactor on next version ?
    public async ping(peer: P2P.IPeer, timeoutMsec: number, force: boolean = false): Promise<any> {

        if (peer.recentlyPinged() && !force) {
            return undefined;
        }

        const getStatusTimeout = timeoutMsec < 5000 ? timeoutMsec : 5000;
        const pingResponse: IPeerPingResponse = await this.emit(
            peer,
            "p2p.peer.getStatus",
            undefined,
            getStatusTimeout,
        );

        if (!pingResponse) {
            throw new PeerStatusResponseError(peer.ip);
        }

        peer.lastPinged = dayjs();
        peer.state = pingResponse.state;
        peer.plugins = pingResponse.config.plugins;

        return pingResponse.state;
    }

    public async pingPorts(peer: P2P.IPeer): Promise<void> {
        Promise.all(
            Object.entries(peer.plugins).map(async ([name, plugin]) => {
                peer.ports[name] = -1;
                try {
                    const { status } = await httpie.head(`http://${peer.ip}:${plugin.port}/`);

                    if (status === 200) {
                        peer.ports[name] = plugin.port;
                    }
                } catch {
                    // tslint:disable-next-line: no-empty
                }
            }),
        );
    }

    public validatePeerConfig(peer: P2P.IPeer, config: IPeerConfig): boolean {
        if (config.network.nethash !== app.getConfig().get("network.nethash")) {
            return false;
        }

        peer.version = config.version;

        if (!isValidVersion(peer)) {
            return false;
        }

        return true;
    }

    public async getPeers(peer: P2P.IPeer): Promise<any> {
        this.logger.debug(`Fetching a fresh peer list from ${peer.url}`);

        const getPeersTimeout = 5000;
        return this.emit(peer, "p2p.peer.getPeers", undefined, getPeersTimeout);
    }

    public async hasCommonBlocks(peer: P2P.IPeer, ids: string[], timeoutMsec?: number): Promise<any> {
        try {
            const getCommonBlocksTimeout = timeoutMsec < 5000 ? timeoutMsec : 5000;
            const body: any = await this.emit(peer, "p2p.peer.getCommonBlocks", { ids }, getCommonBlocksTimeout);

            if (!body || !body.common) {
                return false;
            }

            return body.common;
        } catch (error) {
            const sfx = timeoutMsec !== undefined ? ` within ${timeoutMsec} ms` : "";

            this.logger.error(`Could not determine common blocks with ${peer.ip}${sfx}: ${error.message}`);

            this.emitter.emit("internal.p2p.disconnectPeer", { peer });
        }

        return false;
    }

    public async getPeerBlocks(peer: P2P.IPeer) {
        console.log(123);
    }

    private async emit(
        peer: P2P.IPeer,
        event: string,
        data?: any,
        timeout?: number,
        maxPayload?: number,
        disconnectOnError: boolean = true,
    ) {
        let response;
        try {
            this.connector.forgetError(peer);

            const timeBeforeSocketCall: number = new Date().getTime();

            maxPayload = maxPayload || 100 * constants.KILOBYTE; // 100KB by default, enough for most requests
            const connection: AGClientSocket  = this.connector.connect(peer, maxPayload);
            response = await socketEmit(
                peer.ip,
                connection,
                event,
                data,
                {
                    "Content-Type": "application/json",
                },
                timeout,
            );

            peer.latency = new Date().getTime() - timeBeforeSocketCall;
        } catch (e) {
            return undefined;
        }

        return response.data;
    }

}
