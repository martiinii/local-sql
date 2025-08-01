"use client";

import { RedirectType, redirect } from "next/navigation";
import { DataGridTable } from "@/components/data-grid-table";
import { useCurrentConnection } from "@/hooks/use-current-connection";
import { useTableData } from "@/query/table";
import { useAppStore } from "@/store/app.store";

export default function Home() {
  const isInitialized = useAppStore((state) => state.isConnected);
  const view = useAppStore((state) => state.view);
  const connection = useCurrentConnection();

  const isQueryEnabled = !!view && !!isInitialized && !!connection;

  const { data: tableData } = useTableData(
    view?.serverId || "",
    view?.databaseId || "",
    view?.table || "",
    isQueryEnabled,
  );

  if (!isInitialized) {
    return redirect("/", RedirectType.push);
  }

  if (!connection || !view) return null;

  const tableSchema = connection.schemas?.get(view.table);
  if (!tableSchema) return null;

  return <DataGridTable schema={tableSchema} data={tableData || []} />;
}
