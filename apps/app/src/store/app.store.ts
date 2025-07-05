"use client";

import type { Pagination } from "@local-sql/db-types";
import { create } from "zustand";
import { revalidateTable } from "@/query/table";

export type AppView = {
  serverId: string;
  databaseId: string;
  table: string;
};

interface AppStoreState {
  isConnected: boolean;
  connectionAttempts: number;
  view: AppView | null;
  pagination: Pagination;

  setIsConnected: (value: boolean) => void;
  incrementConnectionAttempts: () => void;
  setView: (serverId: string, databaseId: string, table: string) => void;
  setPaginationLimit: (limit: number) => void;
  setPaginationOffset: (offset: number) => void;
  previousPage: () => void;
  nextPage: () => void;
}

export const useAppStore = create<AppStoreState>()((set, get) => ({
  isConnected: false,
  connectionAttempts: 0,
  view: null,
  pagination: {
    limit: 50,
    offset: 0,
  },

  setIsConnected: (value) => set({ isConnected: value }),
  incrementConnectionAttempts: () =>
    set((state) => ({ connectionAttempts: state.connectionAttempts + 1 })),
  setView: (serverId, databaseId, table) => {
    revalidateTable({
      view: {
        serverId,
        databaseId,
        table,
      },
    });
    set((state) => ({
      view: { serverId, databaseId, table },
      pagination: { ...state.pagination, offset: 0 },
    }));
  },
  setPaginationLimit: (limit) =>
    set((state) => ({ pagination: { ...state.pagination, limit } })),
  setPaginationOffset: (offset) =>
    set((state) => ({ pagination: { ...state.pagination, offset } })),
  previousPage: () => {
    const pagination = get().pagination;
    const newOffset = Math.max(0, pagination.offset - pagination.limit);
    set((state) => ({
      pagination: { ...state.pagination, offset: newOffset },
    }));
  },
  nextPage: () => {
    const pagination = get().pagination;
    const newOffset = pagination.offset + pagination.limit;
    set((state) => ({
      pagination: { ...state.pagination, offset: newOffset },
    }));
  },
}));
