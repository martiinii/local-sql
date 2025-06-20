import {
  LOCAL_SERVER_ID,
  type ServerConnectResponse,
} from "@local-sql/db-types";
import { eq } from "drizzle-orm";
import { LOCAL_SERVER_URL } from "../constants";
import { db } from "../db";
import { connection } from "../db/schema/connection";
import { type GatewayApi, getGatewayApi } from "../lib/eden";
import { Connections } from "./connections";

type ServerConstructor = {
  name: string;
  url: string;
  token?: string | null;
};

export class Server {
  name: string;
  url: string;

  private _isConnected = false;
  private _token: string | null = null;
  private _connections: Connections;

  gatewayApi: GatewayApi;

  constructor({ name, url, token }: ServerConstructor) {
    this.name = name;
    this.url = url;
    this._token = token || null;
    this._connections = new Connections();

    this.gatewayApi = getGatewayApi(this.url, this._token);
  }

  get isConnected() {
    return this._isConnected;
  }

  get connections() {
    return this._connections;
  }

  private get isLocalInstance(): boolean {
    return this.url === LOCAL_SERVER_URL;
  }

  /**
   * Connect to server and initialize connections
   * @param force If true, establish connection skipping cache
   * @returns isConnected + connections
   */
  async connect(
    force?: boolean,
  ): Promise<Omit<ServerConnectResponse, "id" | "name">> {
    if (!force && this._isConnected && this.isLocalInstance) {
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
          connections: response.data.connections,
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

  /**
   * Add connection to server. If local server is used, save connection to database
   * @param data Connection data
   * @returns Server connection response (without id and name)
   */
  async addConnection(data: Omit<typeof connection.$inferInsert, "id">) {
    if (this.isLocalInstance) {
      await db.insert(connection).values(data);
    } else {
      // We are adding connection to remote instance of local-sql server.
      // TODO check permission
      await this.gatewayApi.server.local.database.post(data);
    }

    this._isConnected = false;
    return await this.connect();
  }

  async removeConnection(databaseId: string) {
    if (this.isLocalInstance) {
      await db.delete(connection).where(eq(connection.id, databaseId));
      await this._connections.deleteDatabase(databaseId);
    } else {
      // We are removing connection from remote instance of local-sql server
      // TODO check permission
      await this.gatewayApi.server.local.database({ databaseId }).delete();
    }
  }

  /**
   * Updates server data. If a change modifies url or token, it will disconnect server instance
   * @param data Data to update
   */
  update(data: { name?: string; url?: string; token?: string | null }) {
    const isConnectionChanged =
      (data.url ? this.url !== data.url : false) ||
      (data.token ? this._token !== data.token : false);

    if (data.name) this.name = data.name;
    if (data.url) this.url = data.url;
    if (data.token) this._token = data.token;

    if (isConnectionChanged) {
      this._isConnected = false;
    }
  }
}
