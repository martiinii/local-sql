import { drizzle } from "drizzle-orm/libsql";
import { createDatabaseDirectory, DB_PATH_FILE } from "./db-path";
import { relations } from "./relations";

await createDatabaseDirectory();

export const db = drizzle(DB_PATH_FILE, { relations });

type DBType = typeof db;
export type TransactionType = Parameters<
  Parameters<DBType["transaction"]>[0]
>[0];

export const getDbInstance = (tx: TransactionType | null | undefined) => {
  return tx ? tx : db;
};
