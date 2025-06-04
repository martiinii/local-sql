"use client";

import type {
  DBConnectionResponse,
  DBConnectionStatus,
  TableSchema,
  TableWithSchema,
} from "@local-sql/db-types";
import { generateSlug } from "@local-sql/utils/generate-slug";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Connection = {
  name: string;
  slug: string;
  uri: string;
  connectionStatus: DBConnectionStatus;
  tables?: Set<string>;
  schemas?: Map<string, TableSchema>;
};
type PersistedConnection = Pick<Connection, "name" | "slug" | "uri">;

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

interface ConnectionStoreState {
  connections: Connection[];
  getConnectionBySlug: (slug: string) => Connection | undefined;
  addConnection: (connectionData: Omit<PersistedConnection, "slug">) => string;
  removeConnection: (slug: string) => void;
  updateConnectionDetails: (
    slug: string,
    updates: Partial<
      Pick<Connection, "connectionStatus" | "tables" | "schemas">
    >,
  ) => void;
  initializeSingleConnection: (
    slug: string,
    state: DBConnectionResponse | null,
  ) => void;
  initialize: (state: DBConnectionResponse[]) => void;
}

export const useConnectionStore = create<ConnectionStoreState>()(
  persist(
    (set, get) => ({
      connections: [],

      getConnectionBySlug: (slug) => {
        return get().connections.find((conn) => conn.slug === slug);
      },

      addConnection: (data) => {
        const slug = generateSlug(data.name);

        if (get().connections.some((c) => c.slug === slug)) {
          throw new Error(
            "Connection with this name already exists, please choose another one",
          );
        }

        const newConnection: Connection = {
          ...data,
          slug,
          connectionStatus: {
            value: "disconnected",
          },
        };

        set((state) => ({
          connections: [...state.connections, newConnection],
        }));

        return slug;
      },

      removeConnection: (slug) =>
        set((state) => ({
          connections: state.connections.filter((conn) => conn.slug !== slug),
        })),

      updateConnectionDetails: (slug, updates) => {
        set((state) => ({
          connections: state.connections.map((conn) =>
            conn.slug === slug ? { ...conn, ...updates } : conn,
          ),
        }));
      },

      initializeSingleConnection: (slug, data) => {
        const transformedTables = transformDatabaseConnectionResponse(
          data?.tables,
        );

        get().updateConnectionDetails(slug, {
          connectionStatus: data?.connectionStatus,
          ...transformedTables,
        });
      },
      initialize: (data) => {
        const connections = get().connections;

        const connectionsWithStatus: Connection[] = connections.map(
          (conn, i) => {
            const initData = data?.[i] as DBConnectionResponse | null;
            const transformedTables = transformDatabaseConnectionResponse(
              initData?.tables,
            );

            return {
              ...conn,
              ...transformedTables,
              connectionStatus:
                initData?.connectionStatus || conn.connectionStatus,
            };
          },
        );

        set({ connections: connectionsWithStatus });
      },
    }),
    {
      name: "local-sql-connections",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        const persistedConnections = state.connections.map(
          ({ name, slug, uri }) => ({ name, slug, uri }),
        );
        return { connections: persistedConnections };
      },
      merge: (persistedState, currentState) => {
        const typedPersistedState = persistedState as {
          connections?: PersistedConnection[];
        };

        if (typedPersistedState.connections) {
          const rehydratedConnections: Connection[] =
            typedPersistedState.connections.map((persistedConn) => ({
              ...persistedConn,
              connectionStatus: {
                value: "disconnected",
              },
            }));

          return {
            ...currentState,
            connections: rehydratedConnections,
          };
        }

        return currentState;
      },
    },
  ),
);
