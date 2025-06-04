"use client";

import { useAppStore } from "@/store/app.store";
import { useConnectionStore } from "@/store/connections.store";
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
  const getConnectionBySlug = useConnectionStore(
    (state) => state.getConnectionBySlug,
  );

  const connectionName = useMemo(() => {
    if (!appView?.database) return null;
    return getConnectionBySlug(appView.database)?.name;
  }, [getConnectionBySlug, appView?.database]);

  if (!appView) return;
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <Icons.Database />
          {connectionName}
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
