import { Icons } from "@local-sql/ui/components/icons";
import {
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@local-sql/ui/components/sidebar";
import { cn } from "@local-sql/ui/lib/utils";

type DatabaseTableSubItemProps = {
  table: string;
} & React.ComponentProps<typeof SidebarMenuSubButton>;
export const DatabaseTableSubItem = ({
  table,
  className,
  ...props
}: DatabaseTableSubItemProps) => {
  return (
    <SidebarMenuSub>
      <SidebarMenuSubItem>
        <SidebarMenuSubButton
          className={cn(
            "[&>svg]:text-muted-foreground text-muted-foreground",
            className,
          )}
          {...props}
        >
          <Icons.Table className="rotate-180" />
          <span className="truncate">{table}</span>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    </SidebarMenuSub>
  );
};
