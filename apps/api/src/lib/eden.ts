import { treaty } from "@elysiajs/eden";
import type { App } from "..";

const constructEdenApi = (url: string, config?: Parameters<typeof treaty>[1]) =>
  treaty<App>(url, config);

export const getGatewayApi = (serverUrl: string, token?: string | null) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

  return constructEdenApi(serverUrl, { headers });
};

export type GatewayApi = ReturnType<typeof constructEdenApi>;
