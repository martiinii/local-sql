import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { unwrapEdenQuery } from "@/lib/eden-query";
import { type AppView, useAppStore } from "@/store/app.store";
import { getQueryClient } from "./get-query-client";

const TABLE_KEY = "table";

export const useTableData = (
  serverId: string,
  databaseId: string,
  table: string,
  enabled = true,
) => {
  const pagination = useAppStore((state) => state.pagination);

  return useQuery({
    enabled,
    queryKey: [TABLE_KEY, serverId, databaseId, table, pagination],
    queryFn: () =>
      unwrapEdenQuery(
        api.server({ serverId }).database({ databaseId }).data({ table }).get,
      )({ query: pagination }),
  });
};

type RevalidateTableProps = {
  view: AppView;
  clearCache?: boolean;
};
export const revalidateTable = ({ view, clearCache }: RevalidateTableProps) => {
  const queryKey = [TABLE_KEY, view.serverId, view.databaseId, view.table];

  if (clearCache) {
    getQueryClient().resetQueries({
      queryKey,
    });
  } else {
    getQueryClient().invalidateQueries({
      queryKey,
    });
  }
};
