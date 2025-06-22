import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { idColumn } from "../helpers/id";

export const connection = sqliteTable("connection", {
  id: idColumn,
  name: text().notNull(),
  uri: text().notNull(),
});
