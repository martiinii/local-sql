"use client";

import { ConnectionStatus } from "@/features/connection/connection-status";
import { query } from "@/query";
import { useAppStore } from "@/store/app.store";
import type { Connection, Server } from "@/store/servers.store";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@local-sql/ui/components/collapsible";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@local-sql/ui/components/context-menu";
import { Icons } from "@local-sql/ui/components/icons";
import {
  SidebarMenuButton,
  SidebarMenuItem,
} from "@local-sql/ui/components/sidebar";
import type { PropsWithChildren } from "react";
import { DatabaseTableSubItem } from "./database-table-subitem";

type DatabaseMenuItemProps = {
  server: Server;
  connection: Connection;
};
export const DatabaseMenuItem = ({
  server,
  connection,
}: DatabaseMenuItemProps) => {
  if (connection.connectionStatus.value === "connected") {
    return (
      <ConnectedDatabaseMenuItem server={server} connection={connection} />
    );
  }

  return (
    <DisconnectedDatabaseMenuItem server={server} connection={connection} />
  );
};

const DisconnectedDatabaseMenuItem = ({
  server,
  connection,
}: DatabaseMenuItemProps) => {
  const { mutate: connect, isPending } = query.database.useConnectDatabase();

  return (
    <SidebarMenuItem>
      <DatabaseItemContextMenu server={server} databaseId={connection.id}>
        <ContextMenuTrigger asChild>
          <SidebarMenuButton
            onClick={() =>
              connect({ serverId: server.id, databaseId: connection.id })
            }
            disabled={isPending}
          >
            <ConnectionStatus connectionStatus={connection.connectionStatus} />
            <span className="grow truncate">{connection.name}</span>
            <Icons.Connect className="text-muted-foreground group-hover/menu-item:text-primary transition-colors" />
          </SidebarMenuButton>
        </ContextMenuTrigger>
      </DatabaseItemContextMenu>
    </SidebarMenuItem>
  );
};

const ConnectedDatabaseMenuItem = ({
  server,
  connection,
}: DatabaseMenuItemProps) => {
  const appView = useAppStore((state) => state.view);
  const changeAppView = useAppStore((state) => state.setView);

  const isActive =
    appView?.serverId === server.id && appView.databaseId === connection.id;

  return (
    <Collapsible
      key={connection.id}
      asChild
      defaultOpen={connection.connectionStatus.value === "connected"}
    >
      <SidebarMenuItem>
        <DatabaseItemContextMenu server={server} databaseId={connection.id}>
          <ContextMenuTrigger asChild>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton isActive={isActive}>
                <ConnectionStatus
                  connectionStatus={connection.connectionStatus}
                />
                <span className="truncate">{connection.name}</span>
                <Icons.ChevronRight className="ml-auto transition-transform group-data-[state=open]/menu-item:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
          </ContextMenuTrigger>
        </DatabaseItemContextMenu>

        <CollapsibleContent>
          {Array.from(connection.tables || []).map((table) => (
            <DatabaseTableSubItem
              key={table}
              table={table}
              onClick={() => changeAppView(server.id, connection.id, table)}
              isActive={isActive && appView.table === table}
            />
          ))}
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
};

type DatabaseItemContextMenuProps = PropsWithChildren & {
  server: Server;
  databaseId: string;
};
const DatabaseItemContextMenu = ({
  children,
  server,
  databaseId,
}: DatabaseItemContextMenuProps) => {
  const isReadOnly = server.permission === "read";

  const { mutate: diconnectDatabase } = query.database.useDisconnectDatabase();
  const { mutate: deleteDatabase } = query.database.useDeleteDatabase();

  const onDisconnect = () => {
    diconnectDatabase({ serverId: server.id, databaseId });
  };

  const onRemove = () => {
    deleteDatabase({ serverId: server.id, databaseId });
  };

  return (
    <ContextMenu>
      {children}
      <ContextMenuContent>
        {server.isConnected && (
          <ContextMenuItem onClick={onDisconnect}>
            <Icons.Disconnect /> Disconnect
          </ContextMenuItem>
        )}

        {!isReadOnly && (
          <ContextMenuItem onClick={onRemove} variant="destructive">
            <Icons.Disconnect /> Remove
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};
