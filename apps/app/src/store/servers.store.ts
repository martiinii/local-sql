"use client";

import type {
  DBConnectionResponse,
  DBConnectionStatus,
  ServerConnectResponse,
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

export const transformDatabaseTablesResponse = (
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

const transformDatabaseConnectionResponse = ({
  isConnected,
  tables,
  ...data
}: DBConnectionResponse): Connection => {
  return {
    ...data,
    connectionStatus: isConnected
      ? ({
          value: "connected",
        } as const)
      : ({
          value: "disconnected",
        } as const),
    ...transformDatabaseTablesResponse(tables),
  };
};

const transformServerConnectResponse = ({
  connections,
  ...data
}: ServerConnectResponse): Server => {
  return {
    ...data,
    connections: connections.map(transformDatabaseConnectionResponse),
  };
};

const transformPartialServerConnectResponse = (
  data: Partial<
    Pick<ServerConnectResponse, "isConnected" | "name" | "connections">
  >,
): Partial<Server> => {
  if ("connections" in data && data.connections) {
    const { connections, ...updates } = data;
    return {
      ...updates,
      connections: connections.map(transformDatabaseConnectionResponse),
    };
  }

  return { ...data } as Partial<
    Pick<ServerConnectResponse, "isConnected" | "name">
  >;
};

interface ServersStoreState {
  servers: Server[];
  getServerById: (serverId: string) => Server | undefined;
  addServer: (server: ServerConnectResponse) => void;
  deleteServer: (serverId: string) => void;
  updateServerData: (
    serverId: string,
    updates: Partial<
      Pick<ServerConnectResponse, "isConnected" | "name" | "connections">
    >,
  ) => void;

  getDatabaseById: (
    serverId: string,
    databaseId: string,
  ) => Connection | undefined;
  addDatabase: (serverId: string, data: Connection) => void;
  deleteDatabase: (serverId: string, databaseId: string) => void;
  updateDatabaseData: (
    serverId: string,
    databaseId: string,
    updates: Partial<
      Pick<Connection, "connectionStatus" | "schemas" | "tables">
    >,
  ) => void;

  initialize: (state: ServerConnectResponse[]) => void;
}

export const useServersStore = create<ServersStoreState>()((set, get) => ({
  servers: [],

  getServerById: (serverId) => {
    return get().servers.find((server) => server.id === serverId);
  },
  addServer: (server) => {
    set((state) => ({
      servers: [...state.servers, transformServerConnectResponse(server)],
    }));
  },
  deleteServer: (serverId) => {
    set((state) => ({
      servers: state.servers.filter((server) => server.id !== serverId),
    }));
  },
  updateServerData: (serverId, updates) => {
    set((state) => ({
      servers: state.servers.map((server) => {
        if (server.id === serverId) {
          return {
            ...server,
            ...transformPartialServerConnectResponse(updates),
          };
        }

        return server;
      }),
    }));
  },
  getDatabaseById: (serverId, databaseId) => {
    return get()
      .getServerById(serverId)
      ?.connections.find((conn) => conn.id === databaseId);
  },
  addDatabase: (serverId, data) => {
    set((state) => ({
      servers: state.servers.map((server) => {
        if (server.id === serverId) {
          return {
            ...server,
            connections: [...server.connections, data],
          };
        }
        return server;
      }),
    }));
  },
  deleteDatabase: (serverId, databaseId) => {
    set((state) => ({
      servers: state.servers.map((server) => {
        if (server.id === serverId) {
          return {
            ...server,
            connections: server.connections.filter(
              (conn) => conn.id !== databaseId,
            ),
          };
        }
        return server;
      }),
    }));
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
      servers: data.map(transformServerConnectResponse),
    });
  },
}));
