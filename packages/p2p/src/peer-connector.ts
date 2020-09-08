import { app } from "@luodexun/container";
import { P2P } from "@luodexun/interfaces";
import { AGClientSocket, create } from "socketcluster-client";
import { PeerRepository } from "./peer-repository";
import { codec } from "./utils";

export class PeerConnector implements P2P.IPeerConnector {
    private readonly connections: PeerRepository<AGClientSocket> = new PeerRepository<AGClientSocket>();
    private readonly errors: Map<string, string> = new Map<string, string>();

    public all(): AGClientSocket[] {
        return this.connections.values();
    }

    public connection(peer: P2P.IPeer): AGClientSocket {
        return this.connections.get(peer.ip);
    }

    public connect(peer: P2P.IPeer, maxPayload?: number): AGClientSocket {
        const connection = this.connection(peer) || this.create(peer);

        const socket = (connection as any).transport.socket;
        if (maxPayload && socket._receiver) {
            socket._receiver._maxPayload = maxPayload;
        }

        this.connections.set(peer.ip, connection);

        return connection;
    }

    public disconnect(peer: P2P.IPeer): void {
        const connection = this.connection(peer);

        if (connection) {
            this.connections.forget(peer.ip);
        }
    }

    public terminate(peer: P2P.IPeer): void {
        const connection = this.connection(peer);

        if (connection) {
            connection.transport.socket.terminate();

            this.connections.forget(peer.ip);
        }
    }

    public emit(peer: P2P.IPeer, event: string, data: any): void {
        this.connection(peer).invoke(event, data);
    }

    public getError(peer: P2P.IPeer): string {
        return this.errors.get(peer.ip);
    }

    public setError(peer: P2P.IPeer, error: string): void {
        this.errors.set(peer.ip, error);
    }

    public hasError(peer: P2P.IPeer, error: string): boolean {
        return this.getError(peer) === error;
    }

    public forgetError(peer: P2P.IPeer): void {
        this.errors.delete(peer.ip);
    }

    private create(peer: P2P.IPeer): AGClientSocket {
        const connection = create({
            port: peer.port,
            hostname: peer.ip,
            ackTimeout: Math.max(app.resolveOptions("p2p").getBlocksTimeout, app.resolveOptions("p2p").verifyTimeout),
            codecEngine: codec,
        });

        const socket = connection.transport.socket;

        socket.on("ping", () => this.terminate(peer));
        socket.on("pong", () => this.terminate(peer));
        connection.listener("error").once().then(() => {
            this.terminate(peer);
        });

        return connection;
    }
}
