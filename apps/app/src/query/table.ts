import { api } from "@/lib/api";
import { unwrapEdenQuery } from "@/lib/eden-query";
import { useQuery } from "@tanstack/react-query";
import { getQueryClient } from "./get-query-client";

const TABLE_KEY = "table";

export const useTableData = (
  serverId: string,
  databaseId: string,
  table: string,
  enabled = true,
) => {
  return useQuery({
    enabled,
    queryKey: [TABLE_KEY, serverId, databaseId, table],
    queryFn: () =>
      unwrapEdenQuery(
        api.server({ serverId }).database({ databaseId }).data({ table }).get,
      )(),
  });
};

export const revalidateTable = (
  serverId: string,
  databaseId: string,
  table: string,
) => {
  getQueryClient().invalidateQueries({
    queryKey: [TABLE_KEY, serverId, databaseId, table],
  });
};
