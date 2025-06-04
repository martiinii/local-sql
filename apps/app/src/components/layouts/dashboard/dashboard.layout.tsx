import { AppSidebar } from "@/features/sidebar/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@local-sql/ui/components/sidebar";
import { cookies } from "next/headers";
import type { PropsWithChildren } from "react";
import { DashboardMenu } from "./menu/dashboard.menu";

export const DashboardLayout = async ({ children }: PropsWithChildren) => {
  const sidebarState = (await cookies()).get("sidebar:state");

  const defaultOpen = (sidebarState?.value ?? "true") === "true";

  return (
    <div className="h-screen w-screen">
      <div className="grid size-full" style={{ gridTemplate: "100% / 100%" }}>
        <SidebarProvider defaultOpen={defaultOpen}>
          <AppSidebar />
          <SidebarInset>
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
              <DashboardMenu />
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  );
};
