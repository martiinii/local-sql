import path from "node:path";
import { Glob } from "bun";
import chalk from "chalk";

const IMPORT_PATH_PREFIX = "@local-sql/api/";

const files: Record<
  "importPath" | "relativePath" | "fileHash" | "generatedName",
  string
>[] = [];

const glob = new Glob("**/*");

// Read migrations files, calculate hash and save to array
for await (const relativeFilePath of glob.scan("./db/migrations")) {
  const filePath = path.join("db/migrations", relativeFilePath);

  const fileHash = Bun.hash(await Bun.file(filePath).arrayBuffer()).toString(
    16,
  );
  files.push({
    importPath: `${IMPORT_PATH_PREFIX}${filePath}`,
    relativePath: relativeFilePath,
    fileHash,
    generatedName: `file_${fileHash}`,
  });
}

// File comments
let generatedFileContent = `// This file was automatically generated
// You should NOT make any changes in this file as it will be overwritten.
// Instead, to regenerate this file use \`bun generate:migrations\` after generating drizzle-kit migrations\n\n`;

// File imports
for (const file of files) {
  generatedFileContent += `// @ts-ignore\nimport ${file.generatedName} from "${file.importPath}" with { type: "file" };\n`;
}

// File export object containing files
generatedFileContent += `\nexport const migrationFiles = {
${files.map((file) => `  "${file.relativePath}": ${file.generatedName}`).join(",\n")}
};`;

Bun.write("./db/migrations.gen.ts", generatedFileContent);

console.log(
  chalk.green(
    `  - Generated ${chalk.magenta("migrations.gen.ts")} from drizzle-kit migrations`,
  ),
);
