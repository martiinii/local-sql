import { api } from "@/lib/api";
import { useCreateMutation } from "@/lib/create-mutation";
import { unwrapEdenQuery } from "@/lib/eden-query";
import { useAppStore } from "@/store/app.store";
import {
  transformDatabaseConnectionResponse,
  useServersStore,
} from "@/store/servers.store";

export const useInitialize = (hideToastError?: boolean) => {
  const storeInitialize = useServersStore((state) => state.initialize);

  const storeUpdateAppConnection = useAppStore((state) => state.setIsConnected);
  const storeIncrementAttemptsCount = useAppStore(
    (state) => state.incrementConnectionAttempts,
  );

  return useCreateMutation({
    mutationFn: () => unwrapEdenQuery(api.init.post)(),
    onSuccess: (data) => {
      storeInitialize(data);
      storeUpdateAppConnection(true);
    },
    onSettled: () => {
      storeIncrementAttemptsCount();
    },
    onErrorShowToast: !hideToastError,
  });
};

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
      const transformedTables = transformDatabaseConnectionResponse(
        data.tables,
      );

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
