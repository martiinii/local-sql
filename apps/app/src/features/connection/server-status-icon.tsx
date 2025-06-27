import type { ServerPermission } from "@local-sql/db-types";
import { Icons } from "@local-sql/ui/components/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@local-sql/ui/components/tooltip";

type ServerStatusIconProps = {
  error: string | undefined;
  permission: ServerPermission;
};
export const ServerStatusIcon = ({
  error,
  permission,
}: ServerStatusIconProps) => {
  if (!error && permission !== "read") return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {error ? (
          <Icons.TriangleAlert className="text-amber-600" />
        ) : (
          <Icons.Eye className="text-muted-foreground" />
        )}
      </TooltipTrigger>
      <TooltipContent side="right">{error || "Read-only"}</TooltipContent>
    </Tooltip>
  );
};
