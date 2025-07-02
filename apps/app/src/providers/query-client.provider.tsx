"use client";

import { QueryClientProvider as TanStackQueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/query/get-query-client";

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
