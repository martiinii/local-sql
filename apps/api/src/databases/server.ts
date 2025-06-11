import {
  LOCAL_SERVER_ID,
  type ServerConnectResponse,
} from "@local-sql/db-types";
import { LOCAL_SERVER_URL } from "../constants";
import { db } from "../db";
import { type GatewayApi, getGatewayApi } from "../lib/eden";
import { Connections } from "./connections";

type ServerConstructor = {
  name: string;
  url: string;
  token?: string | null;
};

export class Server {
  name: string;

  private _isConnected = false;
  private _url: string;
  private _token: string | null = null;
  private _connections: Connections;

  gatewayApi: GatewayApi;

  constructor({ name, url, token }: ServerConstructor) {
    this.name = name;
    this._url = url;
    this._token = token || null;
    this._connections = new Connections();

    this.gatewayApi = getGatewayApi(this._url, this._token);
  }

  get isConnected() {
    return this._isConnected;
  }

  private get isLocalInstance(): boolean {
    return this._url === LOCAL_SERVER_URL;
  }

  /**
   * Connect to server and initialize connections
   * @returns isConnected + connections
   */
  async connect(): Promise<ServerConnectResponse> {
    if (this._isConnected && this.isLocalInstance) {
      return {
        isConnected: true,
        connections: this.connections.list,
      };
    }

    try {
      this._connections = new Connections();

      if (this.isLocalInstance) {
        const connections = await db.query.connection.findMany();

        await this._connections.add(connections);
        this._isConnected = true;

        return {
          isConnected: true,
          connections: this.connections.list,
        };
      }

      // We are connecting to remote API instance
      const response = await this.gatewayApi
        .server({ serverId: LOCAL_SERVER_ID })
        .get();

      if (response.data) {
        this._isConnected = true;

        // We don't want to store remote local-sql connections, just return them
        return {
          isConnected: true,
          connections: response.data,
        };
      }

      return {
        isConnected: false,
        connections: [],
      };
    } catch {
      return {
        isConnected: false,
        connections: this.connections.list,
      };
    }
  }

  get connections() {
    return this._connections;
  }
}
