import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { idColumn } from "../helpers/id";

export const accessToken = sqliteTable("access_token", {
  id: idColumn,
  token: text().notNull(),
  allowWrite: integer({ mode: "boolean" }),
});
