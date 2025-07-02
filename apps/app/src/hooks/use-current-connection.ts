import { useMemo } from "react";
import { useAppStore } from "@/store/app.store";
import { useServersStore } from "@/store/servers.store";

export const useCurrentConnection = () => {
  const appView = useAppStore((state) => state.view);
  const getDatabase = useServersStore((state) => state.getDatabaseById);

  const connection = useMemo(() => {
    if (!appView) return null;
    return getDatabase(appView.serverId, appView.databaseId) || null;
  }, [appView, getDatabase]);

  return connection;
};
