"use client";

import { query } from "@/query";
import { useAppStore } from "@/store/app.store";
import { type Connection, useConnectionStore } from "@/store/connections.store";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@local-sql/ui/components/collapsible";
import { Icons } from "@local-sql/ui/components/icons";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@local-sql/ui/components/sidebar";
import { cn } from "@local-sql/ui/lib/utils";
import type React from "react";
import { ConnectionStatus } from "../connection/connection-status";

export function NavMain() {
  const connections = useConnectionStore((state) => state.connections);

  return (
    <SidebarMenu>
      {connections.map((conn) => (
        <DatabaseMenuItem key={conn.slug} connection={conn} />
      ))}
    </SidebarMenu>
  );
}

type DatabaseMenuItemProps = {
  connection: Connection;
};
const DatabaseMenuItem = ({ connection }: DatabaseMenuItemProps) => {
  if (connection.connectionStatus.value === "connected") {
    return <ConnectedDatabaseMenuItem connection={connection} />;
  }

  return <DisconnectedDatabaseMenuItem connection={connection} />;
};

const DisconnectedDatabaseMenuItem = ({
  connection,
}: DatabaseMenuItemProps) => {
  const { mutate: connect, isPending } = query.database.useConnectDatabase();

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={() => connect(connection.slug)}
        disabled={isPending}
      >
        <ConnectionStatus connectionStatus={connection.connectionStatus} />
        <span className="grow truncate">{connection.name}</span>
        <Icons.Connect className="text-muted-foreground group-hover/menu-item:text-primary transition-colors" />
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

const ConnectedDatabaseMenuItem = ({ connection }: DatabaseMenuItemProps) => {
  const appView = useAppStore((state) => state.view);
  const changeAppView = useAppStore((state) => state.setView);

  return (
    <Collapsible
      key={connection.slug}
      asChild
      defaultOpen={connection.connectionStatus.value === "connected"}
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton isActive={appView?.database === connection.slug}>
            <ConnectionStatus connectionStatus={connection.connectionStatus} />
            <span className="truncate">{connection.name}</span>
            <Icons.ChevronRight className="ml-auto transition-transform group-data-[state=open]/menu-item:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {Array.from(connection.tables || []).map((table) => (
            <ConnectedDatabaseTableButton
              key={table}
              table={table}
              onClick={() => changeAppView(connection.slug, table)}
              isActive={
                appView?.database === connection.slug && appView.table === table
              }
            />
          ))}
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
};
type ConnectedDatabaseTableButtonProps = {
  table: string;
} & React.ComponentProps<typeof SidebarMenuSubButton>;
export const ConnectedDatabaseTableButton = ({
  table,
  className,
  ...props
}: ConnectedDatabaseTableButtonProps) => {
  return (
    <SidebarMenuSub>
      <SidebarMenuSubItem>
        <SidebarMenuSubButton
          className={cn(
            "[&>svg]:text-muted-foreground text-muted-foreground",
            className,
          )}
          {...props}
        >
          <Icons.Table className="rotate-180" />
          <span className="truncate">{table}</span>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    </SidebarMenuSub>
  );
};
