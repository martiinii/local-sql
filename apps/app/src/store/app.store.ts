"use client";

import { revalidateTable } from "@/query/table";
import { create } from "zustand";

type AppView = {
  serverId: string;
  databaseId: string;
  table: string;
};
interface AppStoreState {
  isConnected: boolean;
  connectionAttempts: number;
  view: AppView | null;

  setIsConnected: (value: boolean) => void;
  incrementConnectionAttempts: () => void;
  setView: (serverId: string, databaseId: string, table: string) => void;
}

export const useAppStore = create<AppStoreState>()((set) => ({
  isConnected: false,
  connectionAttempts: 0,
  view: null,

  setIsConnected: (value) => set({ isConnected: value }),
  incrementConnectionAttempts: () =>
    set((state) => ({ connectionAttempts: state.connectionAttempts + 1 })),
  setView: (serverId, databaseId, table) => {
    revalidateTable(serverId, databaseId, table);
    set({ view: { serverId, databaseId, table } });
  },
}));
