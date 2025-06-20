"use client";

import { CreateConnectionDialog } from "@/features/connection/create-connection.dialog";
import { UpdateServerDialog } from "@/features/server/update-server.dialog";
import { query } from "@/query";
import type { Server } from "@/store/servers.store";
import { LOCAL_SERVER_ID } from "@local-sql/db-types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@local-sql/ui/components/dropdown-menu";
import { Icons } from "@local-sql/ui/components/icons";
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@local-sql/ui/components/sidebar";
import { useState } from "react";
import { DatabaseMenuItem } from "./database-menu-item";

type ServerSidebarGroupProps = {
  server: Server;
};
export const ServerSidebarGroup = ({ server }: ServerSidebarGroupProps) => {
  const [isNewConnOpen, setIsNewConnOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);

  const isLocalServer = server.id === LOCAL_SERVER_ID;

  // Server data
  const { data: serverData, isLoading } = query.server.useServer({
    id: server.id,
    enabled: isUpdateOpen,
  });

  const handlePrefetchServer = () => {
    query.server.prefetchServer({ id: server.id });
  };

  // Mutate
  const { mutate: addConnection, isPending: isPendingAddConn } =
    query.database.useCreateDatabase();

  const { mutate: connectServer, isPending: isPendingInitialize } =
    query.server.useConnect();

  const { mutate: removeServer, isPending: isPendingRemove } =
    query.server.useDeleteServer();

  const isPending = isPendingAddConn || isPendingInitialize || isPendingRemove;

  const onAddConnection = () => {
    setIsNewConnOpen(true);
  };
  const onReconnect = () => {
    connectServer(server.id);
  };
  const onEdit = () => {
    setIsUpdateOpen(true);
  };
  const onRemove = () => {
    removeServer({ serverId: server.id });
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{server.name}</SidebarGroupLabel>
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={isPending}>
          <SidebarGroupAction title="Options">
            {isPending ? (
              <Icons.Loader className="animate-spin" />
            ) : (
              <Icons.Ellipsis />
            )}
            <span className="sr-only">Options</span>
          </SidebarGroupAction>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={onAddConnection}>
            <Icons.Plus /> Add connection
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onReconnect}>
            <Icons.Disconnect />
            Reconnect
          </DropdownMenuItem>
          {!isLocalServer && (
            <>
              <DropdownMenuItem
                onClick={onEdit}
                onMouseEnter={handlePrefetchServer}
                onFocus={handlePrefetchServer}
              >
                <Icons.Settings />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={onRemove}>
                <Icons.Trash />
                Remove
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <CreateConnectionDialog
        serverId={server.id}
        isOpen={isNewConnOpen}
        setIsOpen={setIsNewConnOpen}
      />
      <UpdateServerDialog
        serverId={server.id}
        isOpen={isUpdateOpen}
        setIsOpen={setIsUpdateOpen}
        isLoading={isLoading}
        defaultValues={{
          name: serverData?.name || "",
          url: serverData?.url || "",
          token: "",
        }}
      />
      <SidebarGroupContent>
        <SidebarMenu>
          {server.connections.map((conn) => (
            <DatabaseMenuItem
              key={conn.id}
              serverId={server.id}
              connection={conn}
            />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
