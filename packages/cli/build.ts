import chalk from "chalk";

const transpiler = new Bun.Transpiler({
  loader: "ts",
  target: "node",
  minifyWhitespace: true,
  deadCodeElimination: true,
  tsconfig: {
    compilerOptions: {
      paths: {
        "@/*": ["."],
      },
    },
  },
});

const tsFile = await Bun.file("./bin/local-sql.ts").text();
const jsTranspiled = transpiler.transformSync(tsFile);

const jsWithShebang = `#!/usr/bin/env node\n${jsTranspiled}`;
await Bun.write("./bin/local-sql.js", jsWithShebang);

console.log(chalk.green("Bin script build complete"));
