"use client";

import { query } from "@/query";
import { useAppStore } from "@/store/app.store";
import {
  type Connection,
  type Server,
  useServersStore,
} from "@/store/servers.store";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@local-sql/ui/components/collapsible";
import { Icons } from "@local-sql/ui/components/icons";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
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
  const servers = useServersStore((state) => state.servers);

  return (
    <SidebarContent>
      {servers.map((server) => (
        <ServerSidebarGroup key={server.id} server={server} />
      ))}
    </SidebarContent>
  );
}

type ServerSidebarGroupProps = {
  server: Server;
};
export const ServerSidebarGroup = ({ server }: ServerSidebarGroupProps) => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{server.name}</SidebarGroupLabel>
      <SidebarMenu>
        {server.connections.map((conn) => (
          <DatabaseMenuItem
            key={conn.id}
            serverId={server.id}
            connection={conn}
          />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
};

type DatabaseMenuItemProps = {
  serverId: string;
  connection: Connection;
};
const DatabaseMenuItem = ({ serverId, connection }: DatabaseMenuItemProps) => {
  if (connection.connectionStatus.value === "connected") {
    return (
      <ConnectedDatabaseMenuItem serverId={serverId} connection={connection} />
    );
  }

  return (
    <DisconnectedDatabaseMenuItem serverId={serverId} connection={connection} />
  );
};

const DisconnectedDatabaseMenuItem = ({
  serverId,
  connection,
}: DatabaseMenuItemProps) => {
  const { mutate: connect, isPending } = query.database.useConnectDatabase();

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={() => connect({ serverId, databaseId: connection.id })}
        disabled={isPending}
      >
        <ConnectionStatus connectionStatus={connection.connectionStatus} />
        <span className="grow truncate">{connection.name}</span>
        <Icons.Connect className="text-muted-foreground group-hover/menu-item:text-primary transition-colors" />
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

const ConnectedDatabaseMenuItem = ({
  serverId,
  connection,
}: DatabaseMenuItemProps) => {
  const appView = useAppStore((state) => state.view);
  const changeAppView = useAppStore((state) => state.setView);

  const isActive =
    appView?.serverId === serverId && appView.databaseId === connection.id;

  return (
    <Collapsible
      key={connection.id}
      asChild
      defaultOpen={connection.connectionStatus.value === "connected"}
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton isActive={isActive}>
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
              onClick={() => changeAppView(serverId, connection.id, table)}
              isActive={isActive && appView.table === table}
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
