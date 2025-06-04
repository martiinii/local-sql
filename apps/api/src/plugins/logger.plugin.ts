import type { LoggerType } from "@local-sql/utils/pretty-log";
import chalk from "chalk";
import Elysia, { type StatusMap } from "elysia";
import { prettyLogPlugin } from "./pretty-log.plugin";

export const loggerPlugin = new Elysia({ name: "logger" })
  .use(prettyLogPlugin)
  .derive({ as: "global" }, () => {
    return {
      startTime: process.hrtime(),
    };
  })
  .onAfterResponse(
    { as: "global" },
    ({ startTime, request, set, response, status, prettyLog }) => {
      logExecution(
        prettyLog,
        request,
        status instanceof Error
          ? status.toString()
          : response &&
              typeof response === "object" &&
              "response" in response &&
              typeof response.response === "string"
            ? response.response
            : null,
        response &&
          typeof response === "object" &&
          "status" in response &&
          typeof response.status === "number"
          ? response.status
          : set.status,
        startTime,
      );
    },
  );

const logExecution = (
  logger: LoggerType,
  request: Request,
  error: string | null,
  code: number | keyof StatusMap | undefined,
  startTime: [number, number] | undefined,
) => {
  const [seconds, nanoseconds] = startTime ? process.hrtime(startTime) : [0, 0];
  const miliseconds = seconds * 1e3 + nanoseconds / 1e6;

  const executionTime = miliseconds.toFixed(3);
  const status = typeof code === "number" ? code : 0;

  const path = new URL(request.url).pathname;

  logger(
    `${request.method} ${path} ${pickColor(status)(status)} in ${executionTime}ms`,
  );
  if (error) {
    logger(`${chalk.red(error)}`);
  }
};

const pickColor = (status: number) => {
  switch (true) {
    case status === 0:
      return chalk.bgRed;
    case status < 200:
      return chalk.blue;
    case status < 300:
      return chalk.green;
    case status < 400:
      return chalk.yellow;
    case status < 500:
      return chalk.red;
    default:
      return chalk.redBright;
  }
};
