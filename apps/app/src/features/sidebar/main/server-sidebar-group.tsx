"use client";

import { CreateConnectionDialog } from "@/features/connection/create-connection.dialog";
import { ServerStatusIcon } from "@/features/connection/server-status-icon";
import { UpdateServerDialog } from "@/features/server/update-server.dialog";
import { ManageServerTokensDialog } from "@/features/token/manage-server-tokens.dialog";
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
import { type PropsWithChildren, useState } from "react";
import { DatabaseMenuItem } from "./database-menu-item";

type ServerSidebarGroupProps = {
  server: Server;
};
export const ServerSidebarGroup = ({ server }: ServerSidebarGroupProps) => {
  const [isNewConnOpen, setIsNewConnOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isTokensOpen, setIsTokensOpen] = useState(false);

  // Server data
  const { data: serverData, isPending: isPendingServer } =
    query.server.useServer({
      id: server.id,
      enabled: isUpdateOpen,
    });

  const handlePrefetchServer = () => {
    query.server.prefetchServer({ id: server.id });
  };

  // Mutate
  const { mutate: connectServer, isPending: isPendingInitialize } =
    query.server.useConnect();

  const { mutate: removeServer, isPending: isPendingRemove } =
    query.server.useDeleteServer();

  const isPending = isPendingInitialize || isPendingRemove;

  const onAddConnection = () => {
    setIsNewConnOpen(true);
  };
  const onReconnect = () => {
    connectServer(server.id);
  };
  const onManageTokens = () => {
    setIsTokensOpen(true);
  };
  const onEdit = () => {
    setIsUpdateOpen(true);
  };
  const onRemove = () => {
    removeServer({ serverId: server.id });
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex gap-2 items-center justify-between pr-8">
        <span>{server.name}</span>
        <ServerStatusIcon permission={server.permission} error={server.error} />
      </SidebarGroupLabel>
      <ServerSidebarDropdownMenu
        server={server}
        handlePrefetchServer={handlePrefetchServer}
        onAddConnection={onAddConnection}
        onReconnect={onReconnect}
        onManageTokens={onManageTokens}
        onEdit={onEdit}
        onRemove={onRemove}
      >
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
      </ServerSidebarDropdownMenu>
      <CreateConnectionDialog
        serverId={server.id}
        isOpen={isNewConnOpen}
        setIsOpen={setIsNewConnOpen}
      />
      <UpdateServerDialog
        serverId={server.id}
        isOpen={isUpdateOpen}
        setIsOpen={setIsUpdateOpen}
        isLoading={isPendingServer}
        defaultValues={{
          name: serverData?.name || "",
          url: serverData?.url || "",
          token: "",
        }}
      />
      <ManageServerTokensDialog
        server={server}
        isOpen={isTokensOpen}
        setIsOpen={setIsTokensOpen}
      />
      <SidebarGroupContent>
        <SidebarMenu>
          {server.connections.map((conn) => (
            <DatabaseMenuItem key={conn.id} server={server} connection={conn} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

type ServerSidebarDropdownMenuProps = PropsWithChildren & {
  server: Server;
  onAddConnection: () => void;
  onReconnect: () => void;
  onManageTokens: () => void;
  onEdit: () => void;
  handlePrefetchServer: () => void;
  onRemove: () => void;
};
const ServerSidebarDropdownMenu = ({
  children,
  server,
  onAddConnection,
  onReconnect,
  onManageTokens,
  onEdit,
  handlePrefetchServer,
  onRemove,
}: ServerSidebarDropdownMenuProps) => {
  const isLocalServer = server.id === LOCAL_SERVER_ID;
  const isReadOnly = server.permission === "read";

  return (
    <DropdownMenu>
      {children}
      <DropdownMenuContent>
        {server.isConnected && !isReadOnly && (
          <DropdownMenuItem onClick={onAddConnection}>
            <Icons.Plus /> Add connection
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={onReconnect}>
          <Icons.Disconnect />
          Reconnect
        </DropdownMenuItem>
        {server.isConnected && !isReadOnly && (
          <DropdownMenuItem onClick={onManageTokens}>
            <Icons.Key /> Manage tokens
          </DropdownMenuItem>
        )}
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
  );
};
