import { defineConfig } from "bumpp";
import { globSync } from "tinyglobby";

export default defineConfig({
  files: globSync(
    ["./packages/*/package.json", "./apps/*/package.json", "./package.json"],
    {
      expandDirectories: false,
    },
  ),
});
