import { rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";

// Clean up previous build directory
await rm("./build-docker", {
  recursive: true,
  force: true,
});

// Build the API
await Bun.$`FORCE_COLOR=1 bun build ./src/index.ts --compile --external "@libsql/*" --external libsql --minify-whitespace --minify-syntax --target bun --outfile ./build-docker/server --define 'process.env.IS_BUNDLED=true'`;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create package.json that contains @libsql/client as dependency. It will be used to create node_modules and copy them alongside compiled server https://github.com/oven-sh/bun/issues/18909
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

await Bun.write(
  "./build-docker/package.json",
  JSON.stringify(packageJsonBuild, null, 2),
);
console.log(chalk.green("\nAPI Docker Build completed successfully"));
