declare module "node-media-server" {
  interface NodeMediaServerConfig {
    rtmp?: {
      port?: number;
      chunk_size?: number;
      gop_cache?: boolean;
      ping?: number;
      ping_timeout?: number;
    };
    http?: {
      port?: number;
      allow_origin?: string;
    };
  }

  class NodeMediaServer {
    constructor(config: NodeMediaServerConfig);
    run(): void;
    stop(): void;
    on(event: string, callback: (...args: any[]) => void): void;
    getSession(id: string): { reject: () => void } | null;
  }

  export = NodeMediaServer;
}
