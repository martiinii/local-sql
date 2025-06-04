import type {
  DBConnectionResponse,
  DBValidConnectionStatus,
} from "@local-sql/db-types";
import Elysia from "elysia";
import { createDatabaseConnection } from "../db";
import type { DatabaseConnection } from "../db/database-connection";

class DatabaseConnections {
  private _connectionNames: Set<string> = new Set();
  private _connections: Map<string, DatabaseConnection> = new Map();

  /**
   * Internal function to add database connection and query tables
   * @param name database slug
   * @param uri Database connection
   * @returns Database connection response
   */
  private async addDatabase(
    name: string,
    uri: string,
  ): Promise<DBConnectionResponse> {
    const connection = this._connections.get(name);
    if (connection) {
      const isConnected = connection.isConnected;
      const status: DBValidConnectionStatus = isConnected
        ? "connected"
        : "disconnected";

      const tables = await connection.queryTables();

      return {
        connectionStatus: {
          value: status,
        },
        tables: tables || undefined,
      };
    }

    try {
      const dbConnection = createDatabaseConnection(uri);

      this._connectionNames.add(name);
      this._connections.set(name, dbConnection);

      return {
        connectionStatus: {
          value: "disconnected",
        },
      };
    } catch (e) {
      const errorMsg =
        e instanceof Error
          ? e.message
          : "Unknown error occured while initializing database connection";
      return {
        connectionStatus: {
          value: "error",
          error: errorMsg,
        },
      };
    }
  }

  /**
   * Function to add multiple databases at once
   * @param connections Array of database connections (slug + uri)
   * @returns Databases connection response
   */
  async add(
    connections: { name: string; uri: string }[],
  ): Promise<DBConnectionResponse[]> {
    const res: DBConnectionResponse[] = [];

    for (const connection of connections) {
      const connectionState = await this.addDatabase(
        connection.name,
        connection.uri,
      );
      res.push(connectionState);
    }

    return res;
  }

  get(name: string): DatabaseConnection | null {
    return this._connections.get(name) || null;
  }

  get connectionNames(): string[] {
    return Array.from(this._connectionNames);
  }

  async remove(name: string): Promise<void> {
    const connection = this.get(name);
    if (!connection) {
      return;
    }

    await connection.disconnect();

    this._connectionNames.delete(name);
    this._connections.delete(name);
  }

  async end() {
    const removalPromises: Promise<void>[] = [];

    for (const name of Array.from(this._connectionNames)) {
      removalPromises.push(this.remove(name));
    }

    await Promise.all(removalPromises);
  }
}

export const connectionsStore = new Elysia({ name: "connections-store" }).state(
  "databases",
  new DatabaseConnections(),
);
