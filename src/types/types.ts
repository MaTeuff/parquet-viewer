import { Cell, Row } from "@tanstack/react-table";

export interface ColumnCell {
  getValue: () => any;
  row: Row<Record<string, string>>;
  column: { id: string };
} 