"use client";

import { getQueryClient } from "@/query/get-query-client";
import { QueryClientProvider as TanStackQueryClientProvider } from "@tanstack/react-query";
type QueryClientProviderProps = {
  children: React.ReactNode;
};
export const QueryClientProvider = ({ children }: QueryClientProviderProps) => {
  const queryClient = getQueryClient();

  return (
    <TanStackQueryClientProvider client={queryClient}>
      {children}
    </TanStackQueryClientProvider>
  );
};
