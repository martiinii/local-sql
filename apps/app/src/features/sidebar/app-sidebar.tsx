import { Icons } from "@local-sql/ui/components/icons";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarRail,
} from "@local-sql/ui/components/sidebar";
import { CreateConnectionDialog } from "../connection/create-connection.dialog";
import { secondaryNavData } from "./data/nav.secondary.data";
import { NavMain } from "./nav.main";
import { NavSecondary } from "./nav.secondary";

export const AppSidebar = () => {
  return (
    <Sidebar className="font-medium">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Databases</SidebarGroupLabel>

          <CreateConnectionDialog>
            <SidebarGroupAction title="Add connection">
              <Icons.Plus />
              <span className="sr-only">Add connection</span>
            </SidebarGroupAction>
          </CreateConnectionDialog>

          <NavMain />
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavSecondary items={secondaryNavData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
