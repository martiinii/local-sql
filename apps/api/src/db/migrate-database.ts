import path from "node:path";
import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from ".";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let isDatabaseMigrated = false;

export const migrateDatabase = async () => {
  if (isDatabaseMigrated) return;
  isDatabaseMigrated = true;

  await migrate(db, {
    migrationsFolder: path.join(__dirname, "./migrations"),
  });
};
