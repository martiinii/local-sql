"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@local-sql/ui/components/breadcrumb";
import { Icons } from "@local-sql/ui/components/icons";
import { useMemo } from "react";
import { useAppStore } from "@/store/app.store";
import { useServersStore } from "@/store/servers.store";

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
      <BreadcrumbList className="flex-nowrap">
        <BreadcrumbItem className="hidden md:inline-flex">
          <Icons.Server />
          {currentConnectionName?.serverName}
        </BreadcrumbItem>

        <BreadcrumbSeparator className="hidden md:block" />

        <BreadcrumbItem className="hidden sm:inline-flex">
          <Icons.Database />
          {currentConnectionName?.connectionName}
        </BreadcrumbItem>

        <BreadcrumbSeparator className="hidden sm:block" />

        <BreadcrumbItem>
          <Icons.Table className="rotate-180" />
          {appView.table}
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};
