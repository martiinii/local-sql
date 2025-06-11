import fs from "node:fs/promises";
import path from "node:path";
import { DB_PATH } from "drizzle.config";

let isDirectoryCreated = false;

export const createDatabaseDirectory = async () => {
  if (isDirectoryCreated) return;
  isDirectoryCreated = true;

  const dirname = path.dirname(DB_PATH);
  try {
    await fs.mkdir(dirname, { recursive: true });
  } catch {}
};
