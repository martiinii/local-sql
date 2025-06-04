import { createPrettyLogger } from "@local-sql/utils/pretty-log";
import Elysia from "elysia";

export const prettyLog = createPrettyLogger("API");

export const prettyLogPlugin = new Elysia({ name: "prettyLog" }).decorate(
  "prettyLog",
  prettyLog,
);
