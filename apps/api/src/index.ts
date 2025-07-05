import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { swagger } from "@elysiajs/swagger";
import favicon from "@local-sql/api/../public/favicon.svg" with {
  type: "file",
};
import { LOCAL_SERVER_ID } from "@local-sql/db-types";
import chalk from "chalk";
import { Elysia } from "elysia";
import { adapter } from "./adapter";
import { LOCAL_SERVER_PORT } from "./constants";
import { migrateDatabase } from "./db/migrate-database";
import { IS_BUNDLED } from "./lib/is-bundled";
import { timeout } from "./lib/timeout-util";
import { prettyLog } from "./plugins/pretty-log.plugin";
import { setupPlugin } from "./plugins/setup.plugin";
import { initRouter } from "./routers/init.router";
import { serverRouter } from "./routers/server.router";
import { tokenRouter } from "./routers/token.router";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = new Elysia({
  adapter: adapter,
})
  .use(setupPlugin)
  // Elysia built-in file and @elysiajs/static don't work with Node.js correctly
  .get("/favicon.svg", async ({ set }) => {
    const file = await readFile(
      IS_BUNDLED ? path.join(__dirname, favicon) : favicon,
    );
    set.headers["content-type"] = "image/svg+xml";

    return file;
  })
  // Redirect doesn't work correctly with Node.js
  .get(
    "/",
    ({ set, status }) => {
      set.headers.location = "/swagger";
      return status(307);
    },
    {
      detail: {
        hide: true,
      },
    },
  )
  .use(
    swagger({
      path: "/swagger",
      documentation: {
        info: {
          title: "Local SQL Server API Documentation",
          version: "",
        },
        tags: [
          {
            name: "Initialize",
            description: "Initialize endpoint",
          },
          {
            name: "Server",
            description: "Manage servers",
          },
        ],
      },
      scalarConfig: {
        favicon: "favicon.svg",
      },
    }),
  )
  .use(initRouter)
  .use(serverRouter)
  .use(tokenRouter);

// Start listening on port
const listen = async () => {
  await migrateDatabase();
  await app.store.servers.initialize();

  app.listen(LOCAL_SERVER_PORT, async ({ url }) => {
    prettyLog(
      `Local SQL Server is running at ${chalk.blue(`http://${url.hostname}:${LOCAL_SERVER_PORT}`)}`,
    );
  });
};
listen();

// Graceful shutdown
let isShuttingDown = false;

const gracefulShutdown = async () => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  prettyLog(`Stopping Local SQL Server on port ${LOCAL_SERVER_PORT}`);

  const shutdownAppPromises = [
    app.store.servers.get(LOCAL_SERVER_ID)?.connections.disconnectAll(),
  ];

  try {
    await timeout(
      Promise.all(shutdownAppPromises),
      1e3,
      "Timeout reached during graceful app shutdown",
    );
  } catch (e) {
    prettyLog(
      chalk.red(
        e instanceof Error
          ? e.message
          : "Unknown error occured during graceful app shutdown",
      ),
    );
    process.exit(1);
  }

  process.exit(0);
};

for (const signal of ["SIGINT", "SIGTERM", "SIGQUIT", "SIGHUP"]) {
  process.on(signal, gracefulShutdown);
}

export type App = typeof app;
