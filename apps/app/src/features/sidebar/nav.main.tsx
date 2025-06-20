"use client";

import { useServersStore } from "@/store/servers.store";
import { SidebarContent } from "@local-sql/ui/components/sidebar";
import { ServerSidebarGroup } from "./main/server-sidebar-group";

export const NavMain = () => {
  const servers = useServersStore((state) => state.servers);

  return (
    <SidebarContent>
      {servers.map((server) => (
        <ServerSidebarGroup key={server.id} server={server} />
      ))}
    </SidebarContent>
  );
};
