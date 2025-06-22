import type {
  UseQueryResult,
  UseSuspenseQueryResult,
} from "@tanstack/react-query";
import * as databaseQuery from "./database";
import * as serverQuery from "./server";
import * as tableQuery from "./table";
import * as tokenQuery from "./token";

export type InferQueryApiType<T> = T extends (...args: never) => unknown
  ? ReturnType<T> extends UseSuspenseQueryResult<infer R>
    ? R
    : ReturnType<T> extends UseQueryResult<infer R>
      ? R
      : never
  : T extends UseSuspenseQueryResult<infer R>
    ? R
    : T extends UseQueryResult<infer R>
      ? R
      : never;

export const query = {
  database: databaseQuery,
  table: tableQuery,
  server: serverQuery,
  token: tokenQuery,
};
