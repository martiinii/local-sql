import { type Treaty, treaty } from "@elysiajs/eden";
import type { App } from "@local-sql/api";

export const constructApi = (
  url: string,
  config?: Parameters<typeof treaty>[1],
) => treaty<App>(url, config);

export type ApiResponse<Res extends Record<number, unknown>> =
  Treaty.TreatyResponse<Res>;
