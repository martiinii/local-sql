import type {
  DBAddResponse,
  DBConnectionResponse,
  DBValidConnectionStatus,
} from "@local-sql/db-types";
import { createDatabaseConnection } from "./create-database-connection";
import type { DatabaseConnection } from "./database-connection";

export class Connections {
  private _connectionIds: Set<string> = new Set();
  private _connections: Map<string, DatabaseConnection> = new Map();

  /**
   * Internal function to add database connection and query tables
   * @param id Database id
   * @param name Database name
   * @param uri Database connection
   * @returns Database connection response
   */
  private async addDatabase(
    id: string,
    name: string,
    uri: string,
  ): Promise<DBAddResponse> {
    const connection = this._connections.get(id);
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
      const dbConnection = createDatabaseConnection(name, uri);

      this._connectionIds.add(id);
      this._connections.set(id, dbConnection);

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
   * @param connections Array of database connections (id, name and uri)
   * @returns Array of database connection responses
   */
  async add(
    connections: { id: string; name: string; uri: string }[],
  ): Promise<DBAddResponse[]> {
    const res: DBAddResponse[] = [];

    for (const connection of connections) {
      const connectionState = await this.addDatabase(
        connection.id,
        connection.name,
        connection.uri,
      );
      res.push(connectionState);
    }

    return res;
  }

  /**
   * Get connection
   * @param id Connection id
   * @returns Connection response
   */
  get(id: string): DatabaseConnection | null {
    return this._connections.get(id) || null;
  }

  get list(): DBConnectionResponse[] {
    const connections = Array.from(this._connections);
    return connections.map(([id, conn]) => ({
      id,
      name: conn.name,
      isConnected: conn.isConnected,
      tables: conn.tablesWithSchema,
    }));
  }

  /**
   * Disconnect database
   * @param id Connection id
   */
  async disconnect(id: string) {
    const connection = this._connections.get(id);
    await connection?.disconnect();
  }

  /**
   * Disconnect each database
   */
  async disconnectAll() {
    const disconnectPromises: Promise<boolean>[] = [];

    for (const [, connection] of this._connections) {
      disconnectPromises.push(connection.disconnect());
    }

    await Promise.all(disconnectPromises);
  }

  /**
   * Delete database from set
   * @param id Connection id
   */
  async deleteDatabase(id: string) {
    await this.disconnect(id);
    this._connections.delete(id);
  }
}
