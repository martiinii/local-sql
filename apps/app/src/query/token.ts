import type { ServerPermission } from "@local-sql/db-types";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useCreateMutation } from "@/lib/create-mutation";
import { unwrapEdenQuery } from "@/lib/eden-query";
import { getQueryClient } from "./get-query-client";

const TOKEN_KEY = "token";

type ValidServerPermission = Exclude<ServerPermission, "none">;

type TokenOptions = {
  serverId: string;
  enabled?: boolean;
};
export const tokenOptions = ({ serverId, enabled = true }: TokenOptions) => {
  return queryOptions({
    queryKey: [TOKEN_KEY, serverId],
    queryFn: () => unwrapEdenQuery(api.token({ serverId }).get)(),
    enabled,
  });
};

export const useTokens = (data: TokenOptions) => {
  return useQuery(tokenOptions(data));
};

export const revalidateTokens = (serverId: string) => {
  getQueryClient().invalidateQueries({
    queryKey: [TOKEN_KEY, serverId],
  });
};

export const useCreateToken = () => {
  return useCreateMutation({
    mutationFn: async ({
      serverId,
      permission,
    }: {
      serverId: string;
      permission: ValidServerPermission;
    }) => {
      return await unwrapEdenQuery(api.token({ serverId }).post)({
        permission,
      });
    },
  });
};

export const useUpdateToken = () => {
  return useCreateMutation({
    mutationFn: async ({
      serverId,
      id,
      permission,
    }: {
      serverId: string;
      id: string;
      permission: ValidServerPermission;
    }) => {
      return await unwrapEdenQuery(api.token({ serverId })({ id }).put)({
        permission,
      });
    },
  });
};

export const useDeleteToken = () => {
  return useCreateMutation({
    mutationFn: async ({ serverId, id }: { serverId: string; id: string }) => {
      return await unwrapEdenQuery(api.token({ serverId })({ id }).delete)();
    },
  });
};
