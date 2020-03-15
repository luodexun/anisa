export interface IConnection {
    options: Record<string, any>;

    query:any;

    make(): Promise<IConnection>;

    connect(): Promise<void>;

    disconnect(): Promise<void>;

}
