import { treaty } from "@elysiajs/eden";
import type { App } from "..";

const constructEdenApi = (url: string, config?: Parameters<typeof treaty>[1]) =>
  treaty<App>(url, config);

export const getProxyApi = (serverUrl: string, token?: string | null) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

  return constructEdenApi(serverUrl, { headers });
};

export type ProxyApi = ReturnType<typeof constructEdenApi>;
