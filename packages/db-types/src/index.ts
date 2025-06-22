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

export type DBAddResponse = {
  connectionStatus: DBConnectionStatus;
  tables?: TableWithSchema[];
};

export type DBConnectionResponse = {
  id: string;
  name: string;
  isConnected: boolean;
  tables: TableWithSchema[];
};

export type ServerConnectResponse = {
  id: string;
  name: string;
  permission: ServerPermission;
  error?: string;
  isConnected: boolean;
  connections: DBConnectionResponse[];
};

export type ServerPermission = "none" | "read" | "write";
export const LOCAL_SERVER_ID = "local";
