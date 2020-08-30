
import { IPeer } from "./peer";

export interface IPeerConnector {
    disconnect(peer: IPeer): void;

    emit(peer: IPeer, event: string, data: any): void;

    getError(peer: IPeer): string;
    setError(peer: IPeer, error: string): void;
    hasError(peer: IPeer, error: string): boolean;
    forgetError(peer: IPeer): void;
}
