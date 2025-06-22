import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { idColumn } from "../helpers/id";

export const server = sqliteTable('server', {
    id: idColumn,
    name: text().notNull(),
    url: text().notNull(),
    token: text()
})