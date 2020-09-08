/* tslint:disable:max-line-length */

import { app } from "@luodexun/container";
import { Logger, P2P } from "@luodexun/interfaces";
import { Peer } from "./peer";
import { isWhitelisted } from "./utils";

export class PeerProcessor implements P2P.IPeerProcessor {
    public server: any;

    private readonly logger: Logger.ILogger = app.resolvePlugin<Logger.ILogger>("logger");
    private readonly communicator: P2P.IPeerCommunicator;
    private readonly connector: P2P.IPeerConnector;
    private readonly storage: P2P.IPeerStorage;

    public constructor({
        communicator,
        connector,
        storage,
    }: {
        communicator: P2P.IPeerCommunicator;
        connector: P2P.IPeerConnector;
        storage: P2P.IPeerStorage;
    }) {
        this.communicator = communicator;
        this.connector = connector;
        this.storage = storage;
    }

    public async validateAndAcceptPeer(peer: P2P.IPeer, options: P2P.IAcceptNewPeerOptions = {}): Promise<void> {
        if (this.validatePeerIp(peer, options)) {
            await this.acceptNewPeer(peer, options);
        }
    }

    public validatePeerIp(peer, options: P2P.IAcceptNewPeerOptions = {}): boolean {
        if (app.resolveOptions("p2p").disableDiscovery && !this.storage.hasPendingPeer(peer.ip)) {
            this.logger.warn(`Rejected ${peer.ip} because the relay is in non-discovery mode.`);
            return false;
        }

        if (this.storage.hasPendingPeer(peer.ip)) {
            return false;
        }

        if (!isWhitelisted(app.resolveOptions("p2p").whitelist, peer.ip)) {
            return false;
        }

        if (
            this.storage.getSameSubnetPeers(peer.ip).length >= app.resolveOptions("p2p").maxSameSubnetPeers &&
            !options.seed
        ) {
            if (process.env.CORE_P2P_PEER_VERIFIER_DEBUG_EXTRA) {
                this.logger.warn(
                    `Rejected ${peer.ip} because we are already at the ${
                        app.resolveOptions("p2p").maxSameSubnetPeers
                    } limit for peers sharing the same /24 subnet.`,
                );
            }

            return false;
        }

        return true;
    }

    private async acceptNewPeer(peer, options: P2P.IAcceptNewPeerOptions = {}): Promise<void> {
        if (this.storage.getPeer(peer.ip)) {
            return;
        }

        const newPeer: P2P.IPeer = new Peer(peer.ip);

        try {
            this.storage.setPendingPeer(peer);

            await this.communicator.ping(newPeer, app.resolveOptions("p2p").verifyTimeout);

            this.storage.setPeer(newPeer);

            if (!options.lessVerbose || process.env.CORE_P2P_PEER_VERIFIER_DEBUG_EXTRA) {
                this.logger.debug(`Accepted new peer ${newPeer.ip}:${newPeer.port} (v${newPeer.version})`);
            }
        } catch (error) {
            this.connector.disconnect(newPeer);
        } finally {
            this.storage.forgetPendingPeer(peer);
        }

        return;
    }
}
