import { SidebarTrigger } from "@local-sql/ui/components/sidebar";
import { MenuBreadcrumbs } from "./menu-breadcrumbs";

export const DashboardMenu = () => {
  return (
    <nav className="bg-sidebar/20 flex gap-2 border-b p-2 items-center">
      <SidebarTrigger />
      <MenuBreadcrumbs />
    </nav>
  );
};
