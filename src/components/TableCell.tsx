import { useState, useEffect, useRef } from 'react';
import { ColumnCell } from '../types/types';

interface TableCellProps {
  cellProps: ColumnCell;
  onEdit: (rowIndex: number, columnId: string, value: string) => void;
}

export function TableCell({ cellProps, onEdit }: TableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    setValue(cellProps.getValue()?.toString() ?? '');
  }, [cellProps]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (value !== cellProps.getValue()?.toString()) {
      onEdit(cellProps.row.index, cellProps.column.id, value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setValue(cellProps.getValue()?.toString() ?? '');
      setIsEditing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
        className="cell-input"
      />
    );
  }

  return (
    <div 
      onDoubleClick={handleDoubleClick}
      className="cell-content"
      title="Double click to edit"
    >
      {value}
    </div>
  );
} 