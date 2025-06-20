import {
  LOCAL_SERVER_ID,
  type ServerConnectResponse,
} from "@local-sql/db-types";
import { eq } from "drizzle-orm";
import { LOCAL_SERVER_URL } from "../constants";
import { db } from "../db";
import { server } from "../db/schema/server";
import { Server } from "./server";

export class Servers {
  private _servers: Map<string, Server> = new Map();

  has(id: string): boolean {
    return this._servers.has(id);
  }
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
   * Establish connection with server
   * @param id serverId
   * @param force If true, skips cache
   * @returns Server connection response
   */
  async connectServer(
    id: string,
    force?: boolean,
  ): Promise<ServerConnectResponse | null> {
    const server = this._servers.get(id);
    if (!server) return null;

    const connectionData = await server.connect(force);

    return {
      id,
      name: server.name,
      ...connectionData,
    };
  }

  /**
   * Initialize and connect with local-sql servers (local included)
   * @returns Array of server connection responses
   */
  async initialize(): Promise<ServerConnectResponse[]> {
    const servers = await db.query.server.findMany();

    const serversData: [string, Server][] = await Promise.all(
      servers.map(async (server) => [
        server.id,
        this._servers.get(server.id) ||
          new Server({
            name: server.name,
            url: server.url,
            token: server.token,
          }),
      ]),
    );

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

    const serverConnectPromises: Promise<ServerConnectResponse>[] = [];

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

  /**
   * Add server to database and connect
   * @param data Server name, url and token
   * @returns Server connection response
   */
  async add({
    token,
    ...data
  }: Omit<typeof server.$inferInsert, "id">): Promise<ServerConnectResponse> {
    const [newServer] = await db
      .insert(server)
      .values({ ...data, token: token?.trim() || undefined })
      .returning();

    const serverInstance = new Server({
      name: newServer.name,
      url: newServer.url,
      token: newServer.token,
    });

    this._servers.set(newServer.id, serverInstance);
    return (await this.connectServer(newServer.id, true))!;
  }

  /**
   * Updates and saved new data to database
   * @param data Data to update
   * @returns Server connection response
   */
  async update({
    id,
    token: rawToken,
    ...data
  }: typeof server.$inferInsert & {
    id: string;
  }): Promise<ServerConnectResponse | null> {
    const token = rawToken?.trim() || undefined;
    await db
      .update(server)
      .set({
        ...data,
        token,
      })
      .where(eq(server.id, id))
      .returning();

    const serverToUpdate = this._servers.get(id);
    serverToUpdate?.update({ ...data, token });

    return await this.connectServer(id);
  }

  /**
   * Deletes server from database
   * @param id Server id
   */
  async delete(id: string) {
    await db.delete(server).where(eq(server.id, id));
    this._servers.delete(id);
  }
}
