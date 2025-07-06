import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { IS_BUNDLED } from "@local-sql/api/lib/is-bundled";
import { getTempPath } from "@local-sql/utils/get-appdata-path";
import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from ".";
import { migrationFiles } from "./migrations.gen";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIGRATIONS_TEMP_PATH = path.join(getTempPath(), "migrations");

const saveMigrationsToTemp = async () => {
  await mkdir(path.join(MIGRATIONS_TEMP_PATH, "meta"), { recursive: true });

  await Promise.all(
    Object.entries(migrationFiles).map(async ([filePath, bundledFilePath]) => {
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
