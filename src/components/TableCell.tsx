import { useState, useEffect, useRef } from 'react';
import { ColumnCell } from '../types/types';

interface TableCellProps {
  cellProps: ColumnCell;
  onEdit: (rowIndex: number, columnId: string, value: string) => void;
  value: string;
}

export const TableCell: React.FC<TableCellProps> = ({ cellProps, onEdit, value }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    setEditValue(cellProps.getValue()?.toString() ?? '');
  }, [cellProps]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue !== cellProps.getValue()?.toString()) {
      onEdit(cellProps.row.index, cellProps.column.id, editValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setEditValue(cellProps.getValue()?.toString() ?? '');
      setIsEditing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  const handleClick = () => {
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={editValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
        className="cell-input"
      />
    );
  }

  return (
    <div onClick={handleClick}>
      {editValue || '\u00A0'}
    </div>
  );
}; 