import fs from "node:fs/promises";
import path from "node:path";
import { getAppDataPath } from "@local-sql/utils/get-appdata-path";

export const DB_PATH = path.join(getAppDataPath(), "data.db");
export const DB_PATH_FILE = `file:${DB_PATH}`;

let isDirectoryCreated = false;

export const createDatabaseDirectory = async () => {
  if (isDirectoryCreated) return;
  isDirectoryCreated = true;

  const dirname = path.dirname(DB_PATH);
  try {
    await fs.mkdir(dirname, { recursive: true });
  } catch {}
};
