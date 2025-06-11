import type { TableSchema, TableWithSchema } from "@local-sql/db-types";

export abstract class DatabaseConnection {
  name: string;
  private _isConnected = false;
  protected _uri: string;
  protected _tableNames: Set<string> | null = null;
  protected _tables: Map<string, TableSchema> = new Map();

  constructor(name: string, uri: string) {
    this.name = name;
    this._uri = uri;
  }

  get isConnected() {
    return this._isConnected;
  }

  get tablesWithSchema(): TableWithSchema[] {
    return Array.from(this._tables).map(([table, schema]) => ({
      name: table,
      schema,
    }));
  }

  /**
   * Establish connection to database
   * @returns True if connected, false if an error occured
   */
  async connect(): Promise<{
    isConnected: boolean;
    tables: TableWithSchema[];
  }> {
    if (this._isConnected) {
      return {
        isConnected: true,
        tables: (await this.queryTables()) || [],
      };
    }

    try {
      const connectionState = await this._connect();
      this._isConnected = connectionState;
    } catch {
      this._isConnected = false;
    }

    return {
      isConnected: this._isConnected,
      tables: (await this.queryTables()) || [],
    };
  }

  /**
   * Disconnect database connection
   * @returns True if successfully disconnected
   */
  async disconnect(): Promise<boolean> {
    try {
      await this._disconnect();
    } finally {
      this._isConnected = false;
    }

    return this._isConnected;
  }

  /**
   * Get tables and their schema from database, saves to cache for future reads
   * @param refetch Omits cache if set to true
   * @returns Tables with their schema or null if not connected
   */
  async queryTables(refetch?: boolean): Promise<TableWithSchema[] | null> {
    if (!this.isConnected) return null;

    if (this._tableNames && this._tables && !refetch) {
      return this.tablesWithSchema;
    }

    try {
      const tables = await this._queryTables();
      this._tableNames = new Set(tables);
      this._tables = new Map(); // Reset schemas when fetching tables

      for (const table of this._tableNames) {
        const schema = await this.queryTableSchema(table, refetch);
        this._tables.set(table, schema);
      }
    } catch {
      return [];
    }

    return this.tablesWithSchema;
  }

  /**
   * Internal function to query table schema: column name, type, options
   * @param table Table name
   * @param refetch Omits cache if set to true
   * @returns Table schema
   */
  protected async queryTableSchema(
    table: string,
    refetch?: boolean,
  ): Promise<TableSchema> {
    if (this._tables.has(table) && !refetch) {
      return this._tables.get(table) || [];
    }

    try {
      const schema = await this._queryTableSchema(table);
      return schema;
    } catch (e) {
      return [];
    }
  }

  async queryData(table: string): Promise<Record<string, unknown>[] | null> {
    if (!this.isConnected) return null;
    if (!this._tableNames?.has(table)) return null;

    try {
      const data = await this._queryData(table);
      return data;
    } catch {
      return [];
    }
  }

  protected abstract _connect(): Promise<boolean>;
  protected abstract _disconnect(): Promise<void>;

  protected abstract _queryTables(): Promise<string[]>;
  protected abstract _queryTableSchema(table: string): Promise<TableSchema>;

  protected abstract _queryData(
    table: string,
  ): Promise<Record<string, unknown>[]>;
}
