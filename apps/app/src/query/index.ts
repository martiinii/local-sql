import type { UseSuspenseQueryResult } from "@tanstack/react-query";
import * as databaseQuery from "./database";

export type InferQueryApiType<T> = T extends (...args: never) => unknown
  ? ReturnType<T> extends UseSuspenseQueryResult<infer R>
    ? R
    : never
  : T extends UseSuspenseQueryResult<infer R>
    ? R
    : never;

export const query = {
  database: databaseQuery,
};
