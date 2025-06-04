export type ColumnDataType = "text" | "timestamp";

export type ColumnSchema = {
  columnName: string;
  dataType: "text" | "timestamp";
  hasDefault: boolean;
  isNullable: boolean;
};
export type TableSchema = ColumnSchema[];
export type TableWithSchema = {
  name: string;
  schema: TableSchema;
};

export type DBValidConnectionStatus = "connected" | "disconnected";
export type DBInvalidConnectionStatus = "error";

export type DBConnectionStatus =
  | {
      value: DBValidConnectionStatus;
    }
  | {
      value: DBInvalidConnectionStatus;
      error: string;
    };

export type DBConnectionResponse = {
  connectionStatus: DBConnectionStatus;
  tables?: TableWithSchema[];
};
