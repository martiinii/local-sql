import {
  LOCAL_SERVER_ID,
  type ServersInitializeResponse,
} from "@local-sql/db-types";
import { eq } from "drizzle-orm";
import { LOCAL_SERVER_URL } from "../constants";
import { db } from "../db";
import { server } from "../db/schema/server";
import { Server } from "./server";

export class Servers {
  //   private _serversIds: Set<string> = new Set();
  private _servers: Map<string, Server> = new Map();

  get(id: string) {
    return this._servers.get(id);
  }

  get list() {
    const serversArray = Array.from(this._servers, ([id, serverObject]) => {
      return {
        id,
        name: serverObject.name,
      };
    });

    return serversArray;
  }

  /**
   * Initialize and connect with local-sql servers (local included)
   * @returns Array of servers (id, isConnected, connections)
   */
  async initialize(): Promise<ServersInitializeResponse[]> {
    const servers = await db.query.server.findMany();
    // const ids = servers.map((server) => server.id);

    const serversData: [string, Server][] = servers.map((server) => [
      server.id,
      this._servers.get(server.id) ||
        new Server({
          name: server.name,
          url: server.url,
          token: server.token,
        }),
    ]);

    // this._serversIds = new Set([LOCAL_SERVER_ID, ...ids]);
    this._servers = new Map([
      [
        LOCAL_SERVER_ID,
        this._servers.get(LOCAL_SERVER_ID) ||
          new Server({
            name: "Local",
            url: LOCAL_SERVER_URL,
          }),
      ],
      ...serversData,
    ]);

    const serverConnectPromises: Promise<ServersInitializeResponse>[] = [];

    for (const [serverId, server] of this._servers) {
      const connect = async () => {
        const connectionData = await server.connect();

        return {
          id: serverId,
          name: server.name,
          ...connectionData,
        };
      };

      serverConnectPromises.push(connect());
    }

    return await Promise.all(serverConnectPromises);
  }

  async add(data: Omit<typeof server.$inferInsert, "id">) {
    await db.insert(server).values(data);
    await this.initialize();
  }

  async delete(id: string) {
    await db.delete(server).where(eq(server.id, id));
    await this.initialize();
  }
}
