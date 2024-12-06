import { ColumnCell } from '../types/types';

interface TableCellProps {
  cellProps: ColumnCell;
  onEdit: (rowIndex: number, columnId: string, value: string) => void;
}

export function TableCell({ cellProps, onEdit }: TableCellProps) {
  const { row, column, getValue } = cellProps;
  
  return (
    <input
      value={getValue()}
      onChange={e => onEdit(row.index, column.id, e.target.value)}
      className="table-cell-input"
    />
  );
} 