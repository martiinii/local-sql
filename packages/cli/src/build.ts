import { rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { copyFiles, prettyPrintBunBuildArtifact } from "@local-sql/utils/cli";
import chalk from "chalk";

// Clean up previous build directory
await rm("./build", {
  recursive: true,
  force: true,
});

// Build the CLI
const result = await Bun.build({
  entrypoints: ["./src/cli.ts"],
  outdir: "./build",
  target: "node",
  minify: {
    syntax: true,
    whitespace: true,
  },
  banner: "#!/usr/bin/env node",
});

for (const output of result.outputs) {
  prettyPrintBunBuildArtifact(output);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create package.json and README for the build
type PackageJson = Record<"description" | "version", string>;
const packageJson: PackageJson = await Bun.file(
  path.join(__dirname, "./package.json"),
).json();

const packageJsonBuild = {
  name: "local-sql",
  description: packageJson.description,
  version: packageJson.version,
  type: "module",
  bin: {
    "local-sql": "./cli.js",
    localsql: "./cli.js",
  },
};

await Bun.write(
  "./build/package.json",
  JSON.stringify(packageJsonBuild, null, 2),
);
await copyFiles({
  pattern: "README.md",
  outdir: "./build",
  baseDir: "../../",
  msgName: "README",
});

console.log(chalk.green("\nCLI Build completed successfully"));
