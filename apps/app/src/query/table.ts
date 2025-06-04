import { api } from "@/lib/api";
import { unwrapEdenQuery } from "@/lib/eden-query";
import { useQuery } from "@tanstack/react-query";
import { getQueryClient } from "./get-query-client";

const TABLE_KEY = "table";

export const useTableData = (slug: string, table: string, enabled = true) => {
  return useQuery({
    enabled,
    queryKey: [TABLE_KEY, slug, table],
    queryFn: () => unwrapEdenQuery(api.db({ slug }).data({ table }).get)(),
  });
};

export const revalidateTable = (slug: string, table: string) => {
  getQueryClient().invalidateQueries({
    queryKey: [TABLE_KEY, slug, table],
  });
};
