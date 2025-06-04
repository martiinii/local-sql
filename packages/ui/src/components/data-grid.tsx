import {
  type Column,
  DataGrid as DataGridPrimitive,
  type RenderCellProps,
  type RenderHeaderCellProps,
  type RenderRowProps,
  Row,
} from "react-data-grid";
import "react-data-grid/lib/styles.css";
import { cn } from "../lib/utils";

const DataGrid: typeof DataGridPrimitive = ({ className, ...props }) => {
  return (
    <DataGridPrimitive className={cn("group/rdg-root", className)} {...props} />
  );
};

export {
  DataGrid,
  Row as DataGridRow,
  type RenderRowProps as DataGridRenderRowProps,
  type Column as DataGridColumn,
  type RenderHeaderCellProps as DataGridRenderHeaderCellProps,
  type RenderCellProps as DataGridRenderCellProps,
};
