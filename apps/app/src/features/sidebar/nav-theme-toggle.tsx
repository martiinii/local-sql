"use client";

import { Icons } from "@local-sql/ui/components/icons";
import {
  SidebarMenuItem,
  SidebarMenuItemSlot,
} from "@local-sql/ui/components/sidebar";
import { ThemeToggleGroup } from "@/components/theme-toggle";

export const NavThemeToggle = () => {
  return (
    <SidebarMenuItem>
      <SidebarMenuItemSlot
        size={"sm"}
        variant={"unstyled"}
        className="text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden"
      >
        <Icons.SunMoon />
        <span className="flex-1">Theme</span>
        <ThemeToggleGroup />
      </SidebarMenuItemSlot>
    </SidebarMenuItem>
  );
};
