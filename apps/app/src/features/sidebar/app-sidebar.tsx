import {
  Sidebar,
  SidebarFooter,
  SidebarRail,
} from "@local-sql/ui/components/sidebar";
import { secondaryNavData } from "./data/nav.secondary.data";
import { NavMain } from "./nav.main";
import { NavSecondary } from "./nav.secondary";

export const AppSidebar = () => {
  return (
    <Sidebar className="font-medium">
      <NavMain />
      <SidebarFooter>
        <NavSecondary items={secondaryNavData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
