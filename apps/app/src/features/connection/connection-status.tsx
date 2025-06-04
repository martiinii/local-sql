import type { DBConnectionStatus } from "@local-sql/db-types";
import { cn } from "@local-sql/ui/lib/utils";

export const ConnectionStatus = ({
  connectionStatus,
  className,
}: { connectionStatus: DBConnectionStatus; className?: string }) => {
  const srOnlyText =
    connectionStatus.value === "error"
      ? connectionStatus.error
      : connectionStatus.value;

  return (
    <div
      className={cn(
        "rounded-full size-1.5",
        connectionStatus.value === "error" && "bg-rose-500",
        connectionStatus.value === "connected" && "bg-emerald-500",
        connectionStatus.value === "disconnected" && "bg-blue-500",
        className,
      )}
    >
      <span className="sr-only">{srOnlyText}</span>
    </div>
  );
};
