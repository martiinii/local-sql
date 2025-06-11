"use client";

import { useAppStore } from "@/store/app.store";
import { useServersStore } from "@/store/servers.store";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@local-sql/ui/components/breadcrumb";
import { Icons } from "@local-sql/ui/components/icons";
import { useMemo } from "react";

export const MenuBreadcrumbs = () => {
  const appView = useAppStore((state) => state.view);
  const getServerById = useServersStore((state) => state.getServerById);

  const currentConnectionName = useMemo(() => {
    if (!appView?.serverId) return null;
    const server = getServerById(appView.serverId);
    const connection = server?.connections.find(
      (conn) => conn.id === appView.databaseId,
    );

    return {
      serverName: server?.name,
      connectionName: connection?.name,
    };
  }, [getServerById, appView?.serverId, appView?.databaseId]);

  if (!appView) return;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <Icons.Server />
          {currentConnectionName?.serverName}
        </BreadcrumbItem>

        <BreadcrumbSeparator />

        <BreadcrumbItem>
          <Icons.Database />
          {currentConnectionName?.connectionName}
        </BreadcrumbItem>

        <BreadcrumbSeparator />

        <BreadcrumbItem>
          <Icons.Table className="rotate-180" />
          {appView.table}
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};
