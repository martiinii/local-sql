import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { constructSpawnArgs } from "@local-sql/utils/cli";
import { detectRuntime } from "@local-sql/utils/detect-runtime";
import { createPrettyLogger } from "@local-sql/utils/pretty-log";
import chalk from "chalk";
import { program } from "commander";

const logger = createPrettyLogger("LOCAL-SQL API");
const RUNTIME = detectRuntime();

// Paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type PackageJson = Record<"name" | "description" | "version", string>;
const packageJson: PackageJson = JSON.parse(
  readFileSync(path.join(__dirname, "./package.json"), "utf8"),
);
program
  .name(packageJson.name)
  .version(packageJson.version)
  .description(packageJson.description)
  .option("-p, --port <number>", "Specify API port number", (value) =>
    Number.parseInt(value, 10),
  )
  .option("--db-path <path>", "Path to the database file")
  .option("--require-token", "Require authentication token for API access")
  .parse(process.argv);

const options: { port?: number; dbPath?: string; requireToken?: boolean } =
  program.opts();

// Helpers

const main = async () => {
  logger(`Detected ${chalk.blue.bold(RUNTIME)} runtime`);

  const elysiaProcess = spawn(
    ...constructSpawnArgs(RUNTIME, false, [path.join(__dirname, "./index.js")]),
    {
      stdio: ["ignore", "pipe", "pipe"],
      env: {
        ...process.env,
        FORCE_COLOR: "1",
        DB_PATH: options.dbPath,
        REQUIRE_TOKEN: options.requireToken ? "true" : undefined,
        PORT: options.port?.toString(),
      },
    },
  );

  elysiaProcess.stdout.on("data", (data) => {
    const fullMessage = String(data);
    const messageWithoutPrefix =
      fullMessage.match(/^.*?\[API\][^\w]\[\d+m (.*)/)?.[1] || fullMessage;

    logger(messageWithoutPrefix);
  });

  // Read and modify stderr (warnings/errors)
  elysiaProcess.stderr.on("data", (data) => {
    logger(`${chalk.red("[ERROR]")} ${data}`);
  });

  // Handle process exit
  elysiaProcess.on("exit", (code) => {
    if (code !== 0) {
      logger(chalk.red("❌ An error occurred while exiting the process"));
    }
  });

  // Stop process
  const cleanup = () => {
    logger("Stopping API...");

    elysiaProcess.kill("SIGTERM");
    process.exit();
  };

  process.on("SIGINT", cleanup); // Ctrl + C
  process.on("SIGTERM", cleanup); // Kill command
};

main();
