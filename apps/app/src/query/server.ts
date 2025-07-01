import { api } from "@/lib/api";
import { useCreateMutation } from "@/lib/create-mutation";
import { unwrapEdenQuery } from "@/lib/eden-query";
import { useAppStore } from "@/store/app.store";
import { useServersStore } from "@/store/servers.store";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { getQueryClient } from "./get-query-client";

const SERVER_KEY = "server";

type ServerOptions = {
  id: string;
  enabled?: boolean;
  staleTime?: number;
};
export const serverOptions = ({
  id,
  enabled = true,
  ...opts
}: ServerOptions) => {
  return queryOptions({
    queryKey: [SERVER_KEY, id],
    queryFn: () => unwrapEdenQuery(api.server({ serverId: id }).get)(),
    enabled,
    ...opts,
  });
};
export const useServer = (data: ServerOptions) => {
  return useQuery(serverOptions(data));
};
export const prefetchServer = (data: ServerOptions) => {
  getQueryClient().prefetchQuery(
    serverOptions({ ...data, staleTime: data.staleTime || 30e3 }),
  );
};

export const revalidateServer = (serverId: string) => {
  getQueryClient().invalidateQueries(serverOptions({ id: serverId }));
};

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

export const useConnect = () => {
  const storeUpdateServer = useServersStore((state) => state.updateServerData);

  return useCreateMutation({
    mutationFn: (serverId: string) =>
      unwrapEdenQuery(api.server({ serverId }).connect.post)(),
    onSuccess: ({ id, ...data }) => {
      storeUpdateServer(id, data);
    },
  });
};

export const useCreateServer = () => {
  const storeAddServer = useServersStore((state) => state.addServer);

  return useCreateMutation({
    mutationFn: async (data: { name: string; url: string; token?: string }) => {
      return await unwrapEdenQuery(api.server.post)(data);
    },
    onSuccess: (data) => {
      storeAddServer(data);
    },
  });
};

export const useUpdateServer = () => {
  const storeUpdateServer = useServersStore((state) => state.updateServerData);

  return useCreateMutation({
    mutationFn: async ({
      serverId,
      ...data
    }: {
      serverId: string;
      name: string;
      url: string;
      token?: string;
    }) => {
      return await unwrapEdenQuery(api.server({ serverId }).put)(data);
    },
    onSuccess: ({ id, ...data }) => {
      storeUpdateServer(id, data);
    },
  });
};

export const useDeleteServer = () => {
  const storeDeleteServer = useServersStore((state) => state.deleteServer);

  return useCreateMutation({
    mutationFn: async (data: { serverId: string }) => {
      return await unwrapEdenQuery(
        api.server({ serverId: data.serverId }).delete,
      )();
    },
    onSuccess: (_, vars) => {
      storeDeleteServer(vars.serverId);
    },
  });
};
