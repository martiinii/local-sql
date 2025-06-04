import { api } from "@/lib/api";
import { useCreateMutation } from "@/lib/create-mutation";
import { unwrapEdenQuery } from "@/lib/eden-query";
import { useAppStore } from "@/store/app.store";
import {
  transformDatabaseConnectionResponse,
  useConnectionStore,
} from "@/store/connections.store";

export const useInitialize = (hideToastError?: boolean) => {
  const storeInitialize = useConnectionStore((state) => state.initialize);
  const storeConnections = useConnectionStore((state) => state.connections);
  const storeUpdateAppConnection = useAppStore((state) => state.setIsConnected);
  const storeIncrementAttemptsCount = useAppStore(
    (state) => state.incrementConnectionAttempts,
  );

  return useCreateMutation({
    mutationFn: () =>
      unwrapEdenQuery(api.init.post)({
        databases: storeConnections.map((conn) => ({
          name: conn.slug,
          uri: conn.uri,
        })),
      }),
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
  const storeUpdateConnection = useConnectionStore(
    (state) => state.updateConnectionDetails,
  );

  return useCreateMutation({
    mutationFn: async (slug: string) => {
      const { connectionStatus } = await unwrapEdenQuery(
        api.db({ slug }).connect.post,
      )();
      const tables = await unwrapEdenQuery(api.db({ slug }).tables.get)();
      return { connectionStatus, tables };
    },
    onSuccess: (data, slug) => {
      const transformedTables = transformDatabaseConnectionResponse(
        data.tables,
      );

      storeUpdateConnection(slug, {
        ...transformedTables,
        connectionStatus: {
          value: data.connectionStatus ? "connected" : "disconnected",
        },
      });
    },
    onError: (error, slug) => {
      storeUpdateConnection(slug, {
        connectionStatus: {
          value: "error",
          error: error.message,
        },
      });
    },
  });
};
