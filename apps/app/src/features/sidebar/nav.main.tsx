"use client";

import { Button } from "@local-sql/ui/components/button";
import { Icons } from "@local-sql/ui/components/icons";
import { SidebarContent, SidebarGroup } from "@local-sql/ui/components/sidebar";
import { useServersStore } from "@/store/servers.store";
import { CreateServerDialog } from "../server/create-server.dialog";
import { ServerSidebarGroup } from "./main/server-sidebar-group";

export const NavMain = () => {
  const servers = useServersStore((state) => state.servers);

  return (
    <SidebarContent>
      {servers.map((server) => (
        <ServerSidebarGroup key={server.id} server={server} />
      ))}
      <SidebarGroup>
        <CreateServerDialog>
          <Button variant={"outline"} size={"sm"}>
            Add server
            <Icons.Plus />
          </Button>
        </CreateServerDialog>
      </SidebarGroup>
    </SidebarContent>
  );
};
