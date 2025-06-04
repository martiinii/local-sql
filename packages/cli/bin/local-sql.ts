#!/usr/bin/env node

import { type ChildProcessByStdio, spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import type Stream from "node:stream";
import { fileURLToPath } from "node:url";
import chalk from "chalk";
import { program } from "commander";

// Logger
type LoggerType = typeof console.log;
const createPrettyLogger = (prefix: string): LoggerType => {
  const prefixStr = chalk.black(`[${prefix}]`);

  return (...data) => console.log(`${prefixStr}`, ...data);
};

const logger = createPrettyLogger("LOCAL-SQL");

// Runtime
type Runtime = "node" | "bun";

const detectRuntime = (): Runtime => {
  if (process.versions?.bun || typeof Bun !== "undefined") {
    return "bun";
  }

  return "node";
};

const RUNTIME = detectRuntime();

logger(`Detected ${chalk.blue.bold(RUNTIME)} runtime`);

// Paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type PackageJson = Record<"name" | "description" | "version", string>;
const packageJson: PackageJson = JSON.parse(
  readFileSync(path.join(__dirname, "../package.json"), "utf8"),
);

program
  .name(packageJson.name)
  .version(packageJson.version)
  .description(packageJson.description)
  .option("-p, --port <number>", "Specify port number", (value) =>
    Number.parseInt(value, 10),
  )
  .option("--no-ui")
  .parse(process.argv);
const options: { port?: number; ui: boolean } = program.opts();

const HOST = "localhost";
const PORT = options.port ?? 7597;

// NEXT APP
let nextProcess: ChildProcessByStdio<
  null,
  Stream.Readable,
  Stream.Readable
> | null;
if (options.ui) {
  nextProcess = spawn(
    RUNTIME,
    [path.join(__dirname, "./app/build/server.js")],
    {
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
        HOSTNAME: HOST,
        PORT: String(PORT),
      },
    },
  );

  nextProcess.stdout.on("data", (data) => {
    const message = String(data);

    if (message.includes("✓ Ready in")) {
      logger(
        `Local SQL is up and running on ${chalk.blue(`http://${HOST}:${PORT}`)}`,
      );
    }
  });

  // Read and modify stderr (warnings/errors)
  nextProcess.stderr.on("data", (data) => {
    process.stderr.write(`${chalk.red("[ERROR]")} ${data}`);
  });

  // Handle process exit
  nextProcess.on("exit", (code) => {
    if (code === 0) {
      logger("✅ Next.js server is running!");
    } else {
      logger(chalk.red("❌ Next.js server failed to start."));
    }
  });
}

// ELYSIA
const elysiaProcess = spawn(
  RUNTIME,
  [path.join(__dirname, "./api/build/index.js")],
  {
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      FORCE_COLOR: "1",
    },
  },
);

elysiaProcess.stdout.on("data", (data) => {
  const fullMessage = String(data);

  if (!options.ui) {
    const messageWithoutPrefix =
      fullMessage.match(/^.*?\[API\][^\w]\[\d+m (.*)/)?.[1] || fullMessage;

    logger(messageWithoutPrefix);
  }
});

// Read and modify stderr (warnings/errors)
elysiaProcess.stderr.on("data", (data) => {
  process.stderr.write(`${chalk.red("[ERROR]")} ${data}`);
});

// Handle process exit
elysiaProcess.on("exit", (code) => {
  if (code === 0) {
    logger("✅ Next.js server is running!");
  } else {
    logger(chalk.red("❌ Next.js server failed to start."));
  }
});

// Stop both processes
const cleanup = () => {
  if (options.ui) {
    logger(`Stopping server on port ${PORT}...`);
  }

  nextProcess?.kill("SIGTERM");
  elysiaProcess.kill("SIGTERM");
  process.exit();
};

process.on("SIGINT", cleanup); // Ctrl + C
process.on("SIGTERM", cleanup); // Kill command
