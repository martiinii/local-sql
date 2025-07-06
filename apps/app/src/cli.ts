import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { constructSpawnArgs } from "@local-sql/utils/cli";
import { detectRuntime } from "@local-sql/utils/detect-runtime";
import { createPrettyLogger } from "@local-sql/utils/pretty-log";
import chalk from "chalk";
import { program } from "commander";

const logger = createPrettyLogger("LOCAL-SQL APP");
const RUNTIME = detectRuntime();

// Paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type PackageJson = Record<"name" | "description" | "version", string>;
const packageJson: PackageJson = JSON.parse(
  readFileSync(path.join(__dirname, "..", "package.json"), "utf8"),
);
program
  .name(packageJson.name)
  .version(packageJson.version)
  .description(packageJson.description)
  .option("-p, --port <number>", "Specify APP port number", (value) =>
    Number.parseInt(value, 10),
  )
  .parse(process.argv);

const options: { port?: number } = program.opts();

// Helpers

const main = async () => {
  logger(`Detected ${chalk.blue.bold(RUNTIME)} runtime`);

  const nextProcess = spawn(
    ...constructSpawnArgs(RUNTIME, false, [path.join(__dirname, "server.js")]),
    {
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
        FORCE_COLOR: "1",
        PORT: options.port?.toString() || "7597",
        HOSTNAME: "localhost", // TODO allow binding other address via options
      },
    },
  );

  nextProcess.stdout.on("data", (data) => {
    const fullMessage = String(data);

    const lines = fullMessage.split("\n");

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.length > 0) {
        logger(trimmedLine);
      }
    }
  });

  // Read and modify stderr (warnings/errors)
  nextProcess.stderr.on("data", (data) => {
    logger(`${chalk.red("[ERROR]")} ${data}`);
  });

  // Handle process exit
  nextProcess.on("exit", (code) => {
    if (code !== 0) {
      logger(chalk.red("❌ An error occurred while exiting the process"));
    }
  });

  // Stop process
  const cleanup = () => {
    logger("Stopping app...");

    nextProcess.kill("SIGTERM");
    process.exit();
  };

  process.on("SIGINT", cleanup); // Ctrl + C
  process.on("SIGTERM", cleanup); // Kill command
};

main();
