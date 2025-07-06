import { ScrollArea, ScrollBar } from "@local-sql/ui/components/scroll-area";
import { SidebarTrigger } from "@local-sql/ui/components/sidebar";
import { DatabasePagination } from "@/features/database-pagination";
import { MenuBreadcrumbs } from "./menu-breadcrumbs";

export const DashboardMenu = () => {
  return (
    <ScrollArea className="w-full">
      <nav className="bg-sidebar/20 flex gap-2 border-b p-2 items-center justify-between">
        <div className="flex gap-2 items-center">
          <SidebarTrigger />
          <MenuBreadcrumbs />
        </div>
        <DatabasePagination />
      </nav>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};
