import { type ChildProcessByStdio, spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import type Stream from "node:stream";
import { fileURLToPath } from "node:url";
import { constructSpawnArgs, preInstallService } from "@local-sql/utils/cli";
import { detectRuntime } from "@local-sql/utils/detect-runtime";
import { createPrettyLogger } from "@local-sql/utils/pretty-log";
import chalk from "chalk";
import { program } from "commander";

const logger = createPrettyLogger("LOCAL-SQL");
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
  .option("-p, --port <number>", "Specify APP port number", (value) =>
    Number.parseInt(value, 10),
  )
  .option("--no-ui", "Run API only")
  .option("--no-api", "Run App only")
  .option("--verbose", "Enable detailed logs")
  .parse(process.argv);

const options: {
  port?: number;
  ui?: boolean;
  api?: boolean;
  verbose?: boolean;
} = program.opts();

type ProcessName = "app" | "api";

const main = async () => {
  logger(`Detected ${chalk.blue.bold(RUNTIME)} runtime`);

  if (!options.api && !options.ui) {
    logger(chalk.red("You must run at least one process, api or app"));
    return process.exit(1);
  }

  logger(chalk.yellow("Installing dependencies..."));

  const versionTag = `@${packageJson.version}`;

  const processes = new Map<
    ProcessName,
    {
      package: string;
      spawnedProcess?: ChildProcessByStdio<
        null,
        Stream.Readable,
        Stream.Readable
      >;
    }
  >();

  if (options.api) {
    processes.set("api", { package: `@local-sql/api${versionTag}` });
  }

  if (options.ui) {
    processes.set("app", { package: `@local-sql/app${versionTag}` });
  }

  await Promise.all(
    processes.values().map((proc) => preInstallService(RUNTIME, proc.package)),
  );

  logger(chalk.green("Dependencies installed!"));

  if (processes.has("api")) {
    const apiProcessObj = processes.get("api")!;

    const apiProcess = spawn(
      ...constructSpawnArgs(RUNTIME, true, [apiProcessObj.package]),
      {
        stdio: ["ignore", "pipe", "pipe"],
        env: {
          ...process.env,
          FORCE_COLOR: "1",
        },
      },
    );

    processes.set("api", { ...apiProcessObj, spawnedProcess: apiProcess });
  }

  if (processes.has("app")) {
    const appProcessObj = processes.get("app")!;

    const appProcess = spawn(
      ...constructSpawnArgs(
        RUNTIME,
        true,
        [
          appProcessObj.package,
          options.port ? ["--port", options.port.toString()] : null,
        ]
          .flat()
          .filter(Boolean) as string[],
      ),
      {
        stdio: ["ignore", "pipe", "pipe"],
        env: {
          ...process.env,
          FORCE_COLOR: "1",
        },
      },
    );

    processes.set("app", { ...appProcessObj, spawnedProcess: appProcess });
  }

  for (const [name, { spawnedProcess }] of processes.entries()) {
    if (!spawnedProcess) return;

    const verboseColor = name === "api" ? chalk.yellow : chalk.cyan;
    const processTag = verboseColor(`[${name.toUpperCase()}]`);

    spawnedProcess.stdout.on("data", (data) => {
      if (!options.verbose) return;

      const fullMessage = String(data);

      const lines = fullMessage.split("\n");

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.length > 0) {
          const messageWithoutPrefix =
            trimmedLine.match(/^.*?\[.*?\][^\w]\[\d+m (.*)/m)?.[1] ||
            trimmedLine;

          logger(`${processTag} ${messageWithoutPrefix}`);
        }
      }
    });

    spawnedProcess.stderr.on("data", (data) => {
      logger(`${processTag} ${chalk.red("[ERROR]")} ${data}`);
    });

    // Handle process exit
    spawnedProcess.on("exit", (code) => {
      if (code !== 0) {
        logger(chalk.red(`❌ An error occurred while exiting ${name} process`));
      }
    });
  }

  // Stop process
  const cleanup = () => {
    logger("Stopping local-sql...");

    for (const { spawnedProcess } of processes.values()) {
      spawnedProcess?.kill("SIGTERM");
    }
    process.exit();
  };

  process.on("SIGINT", cleanup); // Ctrl + C
  process.on("SIGTERM", cleanup); // Kill command
};

main();
