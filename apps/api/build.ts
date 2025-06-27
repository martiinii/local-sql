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

// Build the API
const result = await Bun.build({
  entrypoints: ["./src/index.ts", "./src/cli.ts"],
  outdir: "./build",
  target: "node",
  minify: {
    syntax: true,
    whitespace: true,
  },
  banner: "#!/usr/bin/env node",
  define: {
    "process.env.IS_BUNDLED": "true",
  },
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

const extractDependenciesNames = ["@libsql/client"];
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
    "@local-sql/api": "./cli.js",
  },
  dependencies: extractedDependencies,
};

const readmeFile = Bun.file(path.join(__dirname, "./README.md"));

await Bun.write(
  "./build/package.json",
  JSON.stringify(packageJsonBuild, null, 2),
);
await Bun.write("./build/README.md", readmeFile);

// Copy public assets
await copyFiles({
  pattern: "**/*",
  outdir: "./build/public",
  baseDir: "./public",
  msgName: "public",
});

// Copy migrations
await copyFiles({
  pattern: "**/*",
  outdir: "./build/migrations",
  baseDir: "./src/db/migrations",
  msgName: "migrations",
});

console.log(chalk.green("\nAPI Build completed successfully"));
