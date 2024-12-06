import { FiUpload } from 'react-icons/fi';

interface ImportButtonProps {
  label: string;
  accept: string;
  isLoading: boolean;
  disabled?: boolean;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ImportButton = ({
  label,
  accept,
  isLoading,
  disabled = false,
  onFileSelect,
}: ImportButtonProps) => {
  return (
    <label 
      className={`button button--import`}
      style={{ opacity: !disabled ? 1 : 0.5 }}
    >
      <FiUpload />
      {isLoading ? 'Importing...' : label}
      <input
        type="file"
        accept={accept}
        onChange={onFileSelect}
        disabled={disabled}
        style={{ display: 'none' }}
      />
    </label>
  );
}; 