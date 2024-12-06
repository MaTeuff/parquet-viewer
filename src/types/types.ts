export interface Car {
  manufacturer: string;
  color: string;
  engine: string;
}

export interface ColumnCell {
  row: { index: number };
  column: { id: string };
  getValue: () => string;
} 