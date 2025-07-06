import { spawn } from "node:child_process";
import path, { join } from "node:path";
import chalk from "chalk";
import prettyBytes from "pretty-bytes";
import type { Runtime } from "./detect-runtime";

export const constructSpawnArgs = (
  runtime: Runtime,
  isExecutable: boolean,
  args: string[],
) => {
  const command =
    runtime === "bun"
      ? isExecutable
        ? "bunx"
        : "bun"
      : isExecutable
        ? "npx"
        : "node";
  const constructedArgs = [
    isExecutable ? (runtime === "bun" ? "--bun" : "--yes") : null,
    ...args,
  ].filter(Boolean) as string[];

  return [command, constructedArgs] as const;
};

export const preInstallService = (runtime: Runtime, packageName: string) => {
  return new Promise<void>((resolve) => {
    const cmd = constructSpawnArgs(runtime, true, [packageName, "--version"]);
    const serviceProcess = spawn(...cmd, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    serviceProcess.on("close", resolve);
  });
};

type CopyFilesOptions = {
  pattern: string;
  outdir: string;
  baseDir?: string;
  msgName?: string;
};
export const copyFiles = async ({
  pattern,
  outdir,
  baseDir,
  msgName,
}: CopyFilesOptions) => {
  const glob = new Bun.Glob(pattern);
  let fileCount = 0;

  for await (const filePath of glob.scan({ cwd: baseDir, dot: true })) {
    fileCount++;
    const file = Bun.file(join(baseDir || ".", filePath));

    const outputPath = join(outdir, filePath);

    await Bun.write(outputPath, file);
  }

  if (msgName) {
    console.log(
      chalk.green(
        `  - Copied ${chalk.yellow(fileCount)} file(s) ${chalk.blue(`(${msgName})`)}`,
      ),
    );
  }
};

export const prettyPrintBunBuildArtifact = (artifact: Bun.BuildArtifact) => {
  const size = prettyBytes(artifact.size);
  const fileName = path.basename(artifact.path);

  console.log(
    chalk.green(`  - Bundled ${fileName} ${chalk.yellow(`(${size})`)}`),
  );
};
