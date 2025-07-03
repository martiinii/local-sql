import {
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@local-sql/ui/components/sidebar";
import Link from "next/link";
import type { SecondaryNavType } from "./data/nav.secondary.data";
import { NavThemeToggle } from "./nav-theme-toggle";

type NavSecondaryProps = {
  items: SecondaryNavType[];
};
export function NavSecondary({
  items,
}: NavSecondaryProps & React.ComponentProps<"ul">) {
  return (
    <SidebarGroupContent>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              className="text-sidebar-foreground/70"
              asChild
              size={"sm"}
              tooltip={item.title}
              aria-disabled={item.disabled}
            >
              {item.external ? (
                <a href={item.url} target="_blank" rel="noopener">
                  <item.icon />
                  <span>{item.title}</span>
                </a>
              ) : (
                <Link href={item.url} prefetch>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
        <NavThemeToggle />
      </SidebarMenu>
    </SidebarGroupContent>
  );
}
