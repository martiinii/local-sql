import path from "node:path";
import { getAppDataPath } from "@local-sql/utils/get-appdata-path";
import { defineConfig } from "drizzle-kit";

export const DB_PATH = path.join(getAppDataPath(), "data.db");
export const DB_PATH_FILE = `file:${DB_PATH}`;

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema",
  out: "./src/db/migrations",
  dbCredentials: {
    url: DB_PATH_FILE,
  },
});
