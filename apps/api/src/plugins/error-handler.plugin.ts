import chalk from "chalk";
import Elysia from "elysia";
import { prettyLogPlugin } from "./pretty-log.plugin";

export const errorHandlerPlugin = new Elysia({ name: "errorHandler" })
  .use(prettyLogPlugin)
  .onError(
    { as: "global" },
    ({ request, path, error, set, code, prettyLog }) => {
      const statusCode =
        code === "NOT_FOUND"
          ? 404
          : typeof set.status === "number"
            ? set.status
            : 500;

      if (statusCode === 404) {
        prettyLog(`${request.method} ${path} ${chalk.red(statusCode)}`);
      }
      return new Response("message" in error ? error.message : undefined, {
        status: statusCode,
      });
    },
  );
