"use client";

import type {
  DBConnectionStatus,
  ServersInitializeResponse,
  TableSchema,
  TableWithSchema,
} from "@local-sql/db-types";
import { create } from "zustand";

export type Server = {
  id: string;
  name: string;
  isConnected: boolean;
  connections: Connection[];
};
export type Connection = {
  id: string;
  name: string;
  connectionStatus: DBConnectionStatus;
  tables?: Set<string>;
  schemas?: Map<string, TableSchema>;
};

export const transformDatabaseConnectionResponse = (
  tablesWithSchema: TableWithSchema[] | null | undefined,
): Pick<Connection, "tables" | "schemas"> => {
  if (!tablesWithSchema)
    return {
      schemas: undefined,
      tables: undefined,
    };
  const tableNames = tablesWithSchema
    ? new Set(tablesWithSchema.map((table) => table.name))
    : undefined;
  const schemas = tablesWithSchema
    ? new Map(tablesWithSchema.map((table) => [table.name, table.schema]))
    : undefined;

  return {
    tables: tableNames,
    schemas,
  };
};

interface ServersStoreState {
  //   connections: Connection[];
  //   getConnectionBySlug: (slug: string) => Connection | undefined;
  //   addConnection: (connectionData: Omit<PersistedConnection, "slug">) => string;
  //   removeConnection: (slug: string) => void;
  //   updateConnectionDetails: (
  //     slug: string,
  //     updates: Partial<
  //       Pick<Connection, "connectionStatus" | "tables" | "schemas">
  //     >,
  //   ) => void;
  //   initializeSingleConnection: (
  //     slug: string,
  //     state: DBConnectionResponse | null,
  //   ) => void;
  //   initialize: (state: DBConnectionResponse[]) => void;
  servers: Server[];
  getServerById: (serverId: string) => Server | undefined;
  getDatabaseById: (
    serverId: string,
    databaseId: string,
  ) => Connection | undefined;
  updateDatabaseData: (
    serverId: string,
    databaseId: string,
    updates: Partial<
      Pick<Connection, "connectionStatus" | "schemas" | "tables">
    >,
  ) => void;
  initialize: (state: ServersInitializeResponse[]) => void;
}

export const useServersStore = create<ServersStoreState>()((set, get) => ({
  servers: [],

  getServerById: (serverId) => {
    return get().servers.find((server) => server.id === serverId);
  },
  getDatabaseById: (serverId, databaseId) => {
    return get()
      .getServerById(serverId)
      ?.connections.find((conn) => conn.id === databaseId);
  },
  updateDatabaseData: (serverId, databaseId, updates) => {
    set((state) => ({
      servers: state.servers.map((server) => {
        if (server.id === serverId) {
          return {
            ...server,
            connections: server.connections.map((conn) =>
              conn.id === databaseId ? { ...conn, ...updates } : conn,
            ),
          };
        }
        return server;
      }),
    }));
  },
  initialize: (data) => {
    set({
      servers: data.map((server) => ({
        id: server.id,
        name: server.name,
        isConnected: server.isConnected,
        connections: server.connections.map((conn) => ({
          id: conn.id,
          name: conn.name,
          connectionStatus: conn.isConnected
            ? {
                value: "connected",
              }
            : {
                value: "disconnected",
              },
          ...transformDatabaseConnectionResponse(conn.tables),
        })),
      })),
    });
  },
}));
