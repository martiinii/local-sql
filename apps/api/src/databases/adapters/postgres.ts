import type { ColumnDataType, TableSchema } from "@local-sql/db-types";
import { escapeIdentifier, Pool } from "pg";
import { DatabaseConnection } from "../database-connection";

export class PostgresDatabaseConnection extends DatabaseConnection {
  private _db: Pool;

  constructor(name: string, uri: string) {
    super(name, uri);

    this._db = new Pool({
      connectionString: this._uri,
    });
  }

  protected async _connect(): Promise<boolean> {
    if (this._db.ended || this._db.ending) {
      this._db = new Pool({
        connectionString: this._uri,
      });
    }
    return true; // we are using pool, should be always connected. Using _db.connect() will create new (unused) client. pg manages own clients internally
  }

  protected async _disconnect(): Promise<void> {
    if (!this._db.ended && this._db.ending) {
      await this._db.end();
    }
  }

  protected async _queryTables(): Promise<string[]> {
    const res = await this._db.query<{ tablename: string }>(
      "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'",
    );

    return res.rows.map((row) => row.tablename);
  }

  protected async _queryTableSchema(table: string): Promise<TableSchema> {
    if (!this._tableNames?.has(table)) {
      throw new Error("Invalid table name provided");
    }

    const res = await this._db.query<{
      column_name: string;
      data_type: string;
      character_maximum_length: number | null;
      column_default: string | null;
      is_nullable: "NO" | "YES";
    }>(
      "SELECT column_name, data_type, character_maximum_length, column_default, is_nullable FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = $1 order by ORDINAL_POSITION",
      [table],
    );

    return res.rows.map((row) => ({
      columnName: row.column_name,
      dataType: row.data_type as ColumnDataType, // TODO pass through transform
      hasDefault: !!row.column_default,
      isNullable: row.is_nullable === "YES",
    }));
  }

  protected async _queryData(
    table: string,
  ): Promise<Record<string, unknown>[]> {
    const escapedTableName = escapeIdentifier(table);
    const query = `SELECT * FROM ${escapedTableName}`;

    const res = await this._db.query(query);
    return res.rows;
  }
}
