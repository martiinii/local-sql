import { defineConfig } from "drizzle-kit";
import { DB_PATH_FILE } from "./src/db/db-path";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema",
  out: "./src/db/migrations",
  dbCredentials: {
    url: DB_PATH_FILE,
  },
});
