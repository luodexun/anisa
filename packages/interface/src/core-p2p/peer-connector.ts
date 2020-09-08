
import {AGClientSocket} from "socketcluster-client";
import { IPeer } from "./peer";

export interface IPeerConnector {
    all(): AGClientSocket[];
    connection(peer: IPeer): AGClientSocket;

    connect(peer: IPeer, maxPayload?: number): AGClientSocket;
    disconnect(peer: IPeer): void;

    emit(peer: IPeer, event: string, data: any): void;

    getError(peer: IPeer): string;
    setError(peer: IPeer, error: string): void;
    hasError(peer: IPeer, error: string): boolean;
    forgetError(peer: IPeer): void;
}
