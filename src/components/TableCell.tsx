import { useState, useEffect } from 'react';
import { ColumnCell } from '../types/types';

interface TableCellProps {
  cellProps: ColumnCell;
  onEdit: (rowIndex: number, columnId: string, value: string) => void;
}

export function TableCell({ cellProps, onEdit }: TableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState<string>('');
  
  // Initialize value when the cell data changes
  useEffect(() => {
    setValue(cellProps.getValue()?.toString() ?? '');
  }, [cellProps]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onEdit(cellProps.row.index, cellProps.column.id, value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  if (isEditing) {
    return (
      <input
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        autoFocus
      />
    );
  }

  return <div onDoubleClick={handleDoubleClick}>{value}</div>;
} 