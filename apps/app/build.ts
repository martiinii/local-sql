import { rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { copyFiles, prettyPrintBunBuildArtifact } from "@local-sql/utils/cli";
import chalk from "chalk";

// Clean up previous build directories
await rm("./.next", {
  recursive: true,
  force: true,
});

await rm("./build", {
  recursive: true,
  force: true,
});

// Build the Next app
await Bun.$`bun run build:next`;

// Build CLI
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
type PackageJson = Record<"name" | "description" | "version", string> &
  Record<"dependencies", Record<string, string>>;
const packageJson: PackageJson = await Bun.file(
  path.join(__dirname, "./package.json"),
).json();

const extractDependenciesNames = ["next"];
const extractedDependencies = extractDependenciesNames.reduce(
  (acc, cur) => {
    if (packageJson.dependencies[cur]) {
      acc[cur] = packageJson.dependencies[cur];
    }

    return acc;
  },
  {} as Record<string, string>,
);

const packageJsonBuild = {
  name: packageJson.name,
  description: packageJson.description,
  version: packageJson.version,
  type: "module",
  bin: {
    "@local-sql/app": "./cli.js",
  },
  dependencies: extractedDependencies,
};

const readmeFile = Bun.file(path.join(__dirname, "./README.md"));

await Bun.write(
  "./build/package.json",
  JSON.stringify(packageJsonBuild, null, 2),
);
await Bun.write("./build/README.md", readmeFile);

// Remove cache dir
await rm("./.next/cache", {
  recursive: true,
  force: true,
});

// Copy static assets to standalone app https://nextjs.org/docs/app/api-reference/config/next-config-js/output#automatically-copying-traced-files
await copyFiles({
  pattern: "**/*",
  outdir: "./.next/standalone/apps/app/.next/static",
  baseDir: "./.next/static",
  msgName: "static assets",
});

// Copy standalone app to build directory
await copyFiles({
  pattern: "**/*",
  outdir: "./build",
  baseDir: "./.next/standalone/apps/app",
  msgName: "standalone build",
});

console.log(chalk.green("\nNext.js app Build completed successfully"));
