import { api } from "@/lib/api";
import { useCreateMutation } from "@/lib/create-mutation";
import { unwrapEdenQuery } from "@/lib/eden-query";
import {
  transformDatabaseTablesResponse,
  useServersStore,
} from "@/store/servers.store";

export const useConnectDatabase = () => {
  const storeUpdateConnection = useServersStore(
    (state) => state.updateDatabaseData,
  );

  return useCreateMutation({
    mutationFn: async ({
      serverId,
      databaseId,
    }: { serverId: string; databaseId: string }) => {
      const { isConnected, tables } = await unwrapEdenQuery(
        api.server({ serverId }).database({ databaseId }).connect.post,
      )();
      return { connectionStatus: isConnected, tables };
    },
    onSuccess: (data, { serverId, databaseId }) => {
      const transformedTables = transformDatabaseTablesResponse(data.tables);

      storeUpdateConnection(serverId, databaseId, {
        ...transformedTables,
        connectionStatus: {
          value: data.connectionStatus ? "connected" : "disconnected",
        },
      });
    },
    onError: (error, { serverId, databaseId }) => {
      storeUpdateConnection(serverId, databaseId, {
        connectionStatus: {
          value: "error",
          error: error.message,
        },
      });
    },
  });
};

export const useCreateDatabase = () => {
  const storeSetDatabases = useServersStore((state) => state.updateServerData);
  const storeUpdateServer = useServersStore((state) => state.updateServerData);

  return useCreateMutation({
    mutationFn: async ({
      serverId,
      ...data
    }: { serverId: string; name: string; uri: string }) => {
      return await unwrapEdenQuery(
        api.server.local.database.post, // TODO change local to serverId after endpoint is ready
      )(data);
    },
    onSuccess: (data, { serverId }) => {
      storeSetDatabases(serverId, { connections: data.connections });
    },
    onError: (_, { serverId }) => {
      storeUpdateServer(serverId, { isConnected: false });
    },
  });
};
