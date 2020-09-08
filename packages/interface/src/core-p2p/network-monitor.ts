import {AGServer} from "socketcluster-server";
export interface INetworkStatus {
    forked: boolean;
    blocksToRollback?: number;
}

export interface IRateLimitStatus {
    blocked: boolean;
    exceededLimitOnEndpoint: boolean;
}

export interface INetworkMonitor {
    start(): Promise<void>;
    updateNetworkStatus(initialRun?: boolean): Promise<void>;
    cleansePeers({
        fast,
        forcePing,
        peerCount,
    }?: {
        fast?: boolean;
        forcePing?: boolean;
        peerCount?: number;
    }): Promise<void>;
    discoverPeers(initialRun?: boolean): Promise<boolean>;
    getNetworkHeight(): number;
    getRateLimitedEndpoints(): string[];
    getRateLimitStatus(ip: string, endpoint?: string): Promise<IRateLimitStatus>;
    isBlockedByRateLimit(ip: string): Promise<boolean>;
    refreshPeersAfterFork(): Promise<void>;
    getServer(): AGServer;
    setServer(server: AGServer): void;
    isColdStart(): boolean;
    completeColdStart(): void;
    stopServer(): void;
}
