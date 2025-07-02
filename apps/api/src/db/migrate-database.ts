import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getTempPath } from "@local-sql/utils/get-appdata-path";
import { migrate } from "drizzle-orm/libsql/migrator";
// TODO in the future create script that automatically generates TS file with those imports
// Import migrations so they can be bundled by Bun
// @ts-ignore
import longBeyonder0000 from "@/db/migrations/0000_long_beyonder.sql" with {
  type: "file",
};
// @ts-ignore
import journalData from "@/db/migrations/meta/_journal.json" with {
  type: "file",
};
// @ts-ignore
import snapshot0000 from "@/db/migrations/meta/0000_snapshot.json" with {
  type: "file",
};
import { IS_BUNDLED } from "@/lib/is-bundled";
import { db } from ".";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIGRATIONS_TEMP_PATH = path.join(getTempPath(), "migrations");

const saveMigrationsToTemp = async () => {
  await mkdir(path.join(MIGRATIONS_TEMP_PATH, "meta"), { recursive: true });

  const files = {
    "meta/_journal.json": journalData,
    "meta/000_snapshot.json": snapshot0000,
    "0000_long_beyonder.sql": longBeyonder0000,
  };

  await Promise.all(
    Object.entries(files).map(async ([filePath, bundledFilePath]) => {
      await writeFile(
        path.join(MIGRATIONS_TEMP_PATH, filePath),
        await readFile(
          IS_BUNDLED ? path.join(__dirname, bundledFilePath) : bundledFilePath,
        ),
      );
    }),
  );
};
const deleteMigrationsTemp = async () => {
  await rm(MIGRATIONS_TEMP_PATH, { recursive: true, force: true });
};

let isDatabaseMigrated = false;

export const migrateDatabase = async () => {
  if (isDatabaseMigrated) return;
  isDatabaseMigrated = true;

  await saveMigrationsToTemp();

  await migrate(db, {
    migrationsFolder: MIGRATIONS_TEMP_PATH,
  });

  await deleteMigrationsTemp();
};
