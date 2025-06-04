"use client";

import type { TableSchema } from "@local-sql/db-types";
import {
  DataGrid,
  type DataGridColumn,
  type DataGridRenderCellProps,
  type DataGridRenderHeaderCellProps,
} from "@local-sql/ui/components/data-grid";
import { useMemo } from "react";

type RowType = Record<string, unknown>;

const HeaderCellRenderer = (props: DataGridRenderHeaderCellProps<RowType>) => {
  return (
    <div className="flex w-full items-center font-sans">
      <div className="w-full truncate">
        <span className="text-muted-foreground">{props.column.name}</span>
      </div>
    </div>
  );
};

const CellRenderer = (props: DataGridRenderCellProps<RowType>) => {
  const data = props.row[props.column.key];

  return (
    <div className="group/cell flex h-full w-full items-center px-2">
      <span className="truncate">{data as string}</span>
    </div>
  );
};

const EmptyRowsRenderer = () => {
  return (
    <div className="text-muted-foreground absolute flex h-full w-full flex-col items-center justify-center font-mono tracking-tight">
      <span>No rows</span>
    </div>
  );
};

const defaultColumnOpts: Omit<DataGridColumn<RowType>, "key" | "name"> = {
  minWidth: 100,
  resizable: true,
  width: 200,
  renderHeaderCell: HeaderCellRenderer,
  renderCell: CellRenderer,
};

const createDataGridTableColumns = (
  schema: TableSchema,
): DataGridColumn<RowType>[] => {
  return schema.map((column) => ({
    key: column.columnName,
    name: column.columnName,
    ...defaultColumnOpts,
  }));
};

type DataGridTableProps = {
  schema: TableSchema;
  data: RowType[];
};
function DataGridTable({ schema, data }: DataGridTableProps) {
  const columns = useMemo(() => {
    return createDataGridTableColumns(schema);
  }, [schema]);

  return (
    <DataGrid
      data-slot="rdg-root"
      className="overscroll-x-none"
      columns={columns}
      rows={data}
      renderers={{
        noRowsFallback: <EmptyRowsRenderer />,
      }}
    />
  );
}

export { DataGridTable };
