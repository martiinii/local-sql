import { Button } from "@local-sql/ui/components/button";
import { Icons } from "@local-sql/ui/components/icons";
import {
  Sidebar,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@local-sql/ui/components/sidebar";
import { CreateServerDialog } from "../server/create-server.dialog";
import { secondaryNavData } from "./data/nav.secondary.data";
import { NavMain } from "./nav.main";
import { NavSecondary } from "./nav.secondary";

export const AppSidebar = () => {
  return (
    <Sidebar className="font-medium">
      <SidebarHeader>
        <CreateServerDialog>
          <Button variant={"outline"} size={"sm"}>
            Add server
            <Icons.Plus />
          </Button>
        </CreateServerDialog>
      </SidebarHeader>
      <NavMain />
      <SidebarFooter>
        <NavSecondary items={secondaryNavData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
