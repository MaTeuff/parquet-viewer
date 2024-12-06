import { Row } from "@tanstack/react-table";

export interface ColumnCell {
  getValue: () => any;
  row: Row<Record<string, string>>;
  column: { id: string };
}

export interface Column {
  key: string;
  order: number;
} 