import cors from "@elysiajs/cors";
import Elysia from "elysia";
import { tokenMacro } from "../macro/token.macro";
import { serversStore } from "../store/servers.store";
import { errorHandlerPlugin } from "./error-handler.plugin";
import { loggerPlugin } from "./logger.plugin";
import { prettyLogPlugin } from "./pretty-log.plugin";

export const setupPlugin = new Elysia({ name: "setup" })
  .use(cors())
  .use(prettyLogPlugin)
  .use(errorHandlerPlugin)
  .use(loggerPlugin)
  .use(serversStore)
  .use(tokenMacro);
