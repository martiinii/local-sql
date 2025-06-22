import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from ".";

let isDatabaseMigrated = false;

export const migrateDatabase = async () => {
  if (isDatabaseMigrated) return;
  isDatabaseMigrated = true;

  await migrate(db, {
    migrationsFolder: "./src/db/migrations",
  });
};
