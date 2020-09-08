/* tslint:disable:max-line-length */
import { app } from "@luodexun/container";
import { EventEmitter, Logger, P2P } from "@luodexun/interfaces";
import delay from "delay";
import * as _ from "lodash";
import pluralize from "pluralize";
import prettyMs from "pretty-ms";
import { AGServer } from "socketcluster-server";
import { IPeerData } from "./interfaces";
import { RateLimiter } from "./rate-limiter";
import { buildRateLimiter, checkDNS, checkNTP } from "./utils";

export class NetworkMonitor implements P2P.INetworkMonitor {
    public server: AGServer;
    public config: any;
    public nextUpdateNetworkStatusScheduled: boolean;
    private initializing: boolean = true;
    private coldStart: boolean = false;

    private readonly logger: Logger.ILogger = app.resolvePlugin<Logger.ILogger>("logger");
    private readonly emitter: EventEmitter.EventEmitter = app.resolvePlugin<EventEmitter.EventEmitter>("event-emitter");

    private readonly communicator: P2P.IPeerCommunicator;
    private readonly processor: P2P.IPeerProcessor;
    private readonly storage: P2P.IPeerStorage;
    private readonly rateLimiter: RateLimiter;

    public constructor({
        communicator,
        processor,
        storage,
        options,
    }: {
        communicator: P2P.IPeerCommunicator;
        processor: P2P.IPeerProcessor;
        storage: P2P.IPeerStorage;
        options;
    }) {
        this.config = options;
        this.communicator = communicator;
        this.processor = processor;
        this.storage = storage;
        this.rateLimiter = buildRateLimiter(options);
    }

    public getNetworkState(): Promise<P2P.INetworkState> {
        throw new Error("Method not implemented.");
    }

    public getServer(): AGServer {
        return this.server;
    }

    public setServer(server: AGServer): void {
        this.server = server;
    }

    public stopServer(): void {
        if (this.server) {
            this.server.close();
            this.server = undefined;
        }
    }

    public async start(): Promise<void> {
        await this.checkDNSConnectivity(this.config.dns);
        await this.checkNTPConnectivity(this.config.ntp);

        await this.populateSeedPeers();

        if (this.config.skipDiscovery) {
            this.logger.warn("Skipped peer discovery because the relay is in skip-discovery mode.");
        } else {
            await this.updateNetworkStatus(true);

            for (const [version, peers] of Object.entries(_.groupBy(this.storage.getPeers(), "version"))) {
                this.logger.info(`Discovered ${pluralize("peer", peers.length, true)} with v${version}.`);
            }
        }

        // Give time to cooldown rate limits after peer verifier finished.
        await delay(1000);

        this.initializing = false;
    }

    public async updateNetworkStatus(initialRun?: boolean): Promise<void> {
        if (process.env.NODE_ENV === "test") {
            return;
        }

        if (this.config.networkStart) {
            this.coldStart = true;
            this.logger.warn("Entering cold start because the relay is in genesis-start mode.");
            return;
        }

        if (this.config.disableDiscovery) {
            this.logger.warn("Skipped peer discovery because the relay is in non-discovery mode.");
            return;
        }

        try {
            if (await this.discoverPeers(initialRun)) {
                await this.cleansePeers();
            }
        } catch (error) {
            this.logger.error(`Network Status: ${error.message}`);
        }

        let nextRunDelaySeconds = 600;

        if (!this.hasMinimumPeers()) {
            await this.populateSeedPeers();

            nextRunDelaySeconds = 60;

            this.logger.info(`Couldn't find enough peers. Falling back to seed peers.`);
        }

        this.scheduleUpdateNetworkStatus(nextRunDelaySeconds);
    }

    public async cleansePeers({
        fast = false,
        forcePing = false,
        peerCount,
    }: { fast?: boolean; forcePing?: boolean; peerCount?: number } = {}): Promise<void> {
        let peers = this.storage.getPeers();
        let max = peers.length;

        let unresponsivePeers = 0;
        const pingDelay = fast ? 1500 : app.resolveOptions("p2p").verifyTimeout;

        if (peerCount) {
            peers = _.shuffle(peers).slice(0, peerCount);
            max = Math.min(peers.length, peerCount);
        }

        this.logger.info(`Checking ${max} peers`);
        const peerErrors = {};

        // we use Promise.race to cut loose in case some communicator.ping() does not resolve within the delay
        // in that case we want to keep on with our program execution while ping promises can finish in the background
        await Promise.race([
            Promise.all(
                peers.map(async peer => {
                    try {
                        await this.communicator.ping(peer, pingDelay, forcePing);
                    } catch (error) {
                        unresponsivePeers++;

                        if (peerErrors[error]) {
                            peerErrors[error].push(peer);
                        } else {
                            peerErrors[error] = [peer];
                        }

                        this.emitter.emit("internal.p2p.disconnectPeer", { peer });

                        return undefined;
                    }
                }),
            ),
            delay(pingDelay),
        ]);

        for (const key of Object.keys(peerErrors)) {
            const peerCount = peerErrors[key].length;
            this.logger.debug(`Removed ${peerCount} ${pluralize("peers", peerCount)} because of "${key}"`);
        }

        if (this.initializing) {
            this.logger.info(`${max - unresponsivePeers} of ${max} peers on the network are responsive`);
            this.logger.info(`Median Network Height: ${this.getNetworkHeight().toLocaleString()}`);
        }
    }

    public async discoverPeers(pingAll?: boolean): Promise<boolean> {
        const maxPeersPerPeer: number = 50;
        const ownPeers: P2P.IPeer[] = this.storage.getPeers();
        const theirPeers: P2P.IPeer[] = Object.values(
            (await Promise.all(
                _.shuffle(this.storage.getPeers())
                    .slice(0, 8)
                    .map(async (peer: P2P.IPeer) => {
                        try {
                            const hisPeers = await this.communicator.getPeers(peer);
                            return hisPeers || [];
                        } catch (error) {
                            this.logger.debug(`Failed to get peers from ${peer.ip}: ${error.message}`);
                            return [];
                        }
                    }),
            ))
                .map(peers =>
                    _.shuffle(peers)
                        .slice(0, maxPeersPerPeer)
                        .reduce((acc, curr) => ({ ...acc, ...{ [curr.ip]: curr } }), {}),
                )
                .reduce((acc, curr) => ({ ...acc, ...curr }), {}),
        );

        if (pingAll || !this.hasMinimumPeers() || ownPeers.length < theirPeers.length * 0.75) {
            await Promise.all(theirPeers.map(p => this.processor.validateAndAcceptPeer(p, { lessVerbose: true })));
            this.pingPeerPorts(pingAll);

            return true;
        }

        this.pingPeerPorts();

        return false;
    }

    public async getRateLimitStatus(ip: string, endpoint?: string): Promise<P2P.IRateLimitStatus> {
        return {
            blocked: await this.rateLimiter.isBlocked(ip),
            exceededLimitOnEndpoint: await this.rateLimiter.hasExceededRateLimit(ip, endpoint),
        };
    }

    public getRateLimitedEndpoints(): string[] {
        return this.rateLimiter.getRateLimitedEndpoints();
    }

    public async isBlockedByRateLimit(ip: string): Promise<boolean> {
        return this.rateLimiter.isBlocked(ip);
    }

    public isColdStart(): boolean {
        return this.coldStart;
    }

    public completeColdStart(): void {
        this.coldStart = false;
    }

    public getNetworkHeight(): number {
        const medians = this.storage
            .getPeers()
            .filter(peer => peer.state.height)
            .map(peer => peer.state.height)
            .sort((a, b) => a - b);

        return medians[Math.floor(medians.length / 2)] || 0;
    }

    public async refreshPeersAfterFork(): Promise<void> {
        this.logger.info(`Refreshing ${this.storage.getPeers().length} peers after fork.`);

        await this.cleansePeers({ forcePing: true });
    }


    private async pingPeerPorts(pingAll?: boolean): Promise<void> {
        let peers = this.storage.getPeers();
        if (!pingAll) {
            peers = _.shuffle(peers).slice(0, Math.floor(peers.length / 2));
        }
        Promise.all(
            peers.map(async peer => {
                try {
                    await this.communicator.pingPorts(peer);
                } catch (error) {
                    return undefined;
                }
            }),
        );
    }

    private async checkDNSConnectivity(options): Promise<void> {
        try {
            const host = await checkDNS(options);

            this.logger.info(`Your network connectivity has been verified by ${host}`);
        } catch (error) {
            this.logger.error(error.message);
        }
    }

    private async checkNTPConnectivity(options): Promise<void> {
        try {
            const { host, time } = await checkNTP(options);

            this.logger.info(`Your NTP connectivity has been verified by ${host}`);

            this.logger.info(`Local clock is off by ${time.t < 0 ? "-" : ""}${prettyMs(Math.abs(time.t))} from NTP`);
        } catch (error) {
            this.logger.error(error.message);
        }
    }

    private async scheduleUpdateNetworkStatus(nextUpdateInSeconds): Promise<void> {
        if (this.nextUpdateNetworkStatusScheduled) {
            return;
        }

        this.nextUpdateNetworkStatusScheduled = true;

        await delay(nextUpdateInSeconds * 1000);

        this.nextUpdateNetworkStatusScheduled = false;

        this.updateNetworkStatus();
    }

    private hasMinimumPeers(): boolean {
        if (this.config.ignoreMinimumNetworkReach) {
            this.logger.warn("Ignored the minimum network reach because the relay is in seed mode.");

            return true;
        }

        return Object.keys(this.storage.getPeers()).length >= app.resolveOptions("p2p").minimumNetworkReach;
    }

    private async populateSeedPeers(): Promise<any> {
        const peerList: IPeerData[] = app.getConfig().get("peers.list");

        if (!peerList) {
            app.forceExit("No seed peers defined in peers.json");
        }

        const peers: IPeerData[] = peerList.map(peer => {
            peer.version = app.getVersion();
            return peer;
        });

        return Promise.all(
            Object.values(peers).map((peer: P2P.IPeer) => {
                this.storage.forgetPeer(peer);

                return this.processor.validateAndAcceptPeer(peer, { seed: true, lessVerbose: true });
            }),
        );
    }
}
