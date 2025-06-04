import { useAppStore } from "@/store/app.store";
import { useConnectionStore } from "@/store/connections.store";
import { useMemo } from "react";

export const useCurrentConnection = () => {
  const appView = useAppStore((state) => state.view);
  const getConnection = useConnectionStore(
    (state) => state.getConnectionBySlug,
  );

  const connection = useMemo(() => {
    if (!appView) return null;
    return getConnection(appView.database) || null;
  }, [appView, getConnection]);

  return connection;
};
