import Elysia from "elysia";
import { connectionsStore } from "../store/database-connections.store";
import { errorHandlerPlugin } from "./error-handler.plugin";
import { loggerPlugin } from "./logger.plugin";
import { prettyLogPlugin } from "./pretty-log.plugin";

export const setupPlugin = new Elysia({ name: "setup" })
  .use(prettyLogPlugin)
  .use(errorHandlerPlugin)
  .use(loggerPlugin)
  .use(connectionsStore);
