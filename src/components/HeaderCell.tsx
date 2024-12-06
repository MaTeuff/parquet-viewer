import { useState, useRef, useEffect } from 'react';

interface HeaderCellProps {
  value: string;
  onEdit: (newValue: string) => void;
}

export const HeaderCell: React.FC<HeaderCellProps> = ({ value, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || 'New Column');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    const trimmedValue = editValue.trim();
    if (trimmedValue && trimmedValue !== value) {
      onEdit(trimmedValue);
    } else {
      setEditValue(value || 'New Column');  // Reset to original or default value
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setEditValue(value || 'New Column');
      setIsEditing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
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
        className="header-input"
      />
    );
  }

  return (
    <div onClick={handleClick} className="header-cell">
      {value || 'New Column'}
    </div>
  );
}; 