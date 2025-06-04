import { swagger } from "@elysiajs/swagger";
import chalk from "chalk";
import { Elysia } from "elysia";
import { adapter } from "./adapter";
import { timeout } from "./lib/timeout-util";
import { prettyLog } from "./plugins/pretty-log.plugin";
import { setupPlugin } from "./plugins/setup.plugin";
import { databaseRouter } from "./routers/database.router";
import { initRouter } from "./routers/init.router";

const PORT = 57597;

export const app = new Elysia({
  adapter: adapter,
})
  .use(setupPlugin)
  .use(
    swagger({
      path: "/swagger",
      documentation: {
        info: {
          title: "Local SQL Server API Documentation",
          version: "1.0.0",
        },
      },
    }),
  )
  .use(initRouter)
  .use(databaseRouter)
  .listen(PORT, ({ url }) => {
    prettyLog(
      `Local SQL Server is running at ${chalk.blue(`http://${url.hostname}:${PORT}`)}`,
    );
  });

export type App = typeof app;

// Graceful shutdown
let isShuttingDown = false;

const gracefulShutdown = async () => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  prettyLog(`Stopping Local SQL Server on port ${PORT}`);

  const shutdownAppPromises = [app.store.databases.end()];

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
