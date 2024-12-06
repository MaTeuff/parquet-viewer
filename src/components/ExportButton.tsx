import { FiDownload } from 'react-icons/fi';

interface ExportButtonProps {
  label: string;
  disabled?: boolean;
  onClick: () => void;
}

export const ExportButton = ({
  label,
  disabled = false,
  onClick,
}: ExportButtonProps) => {
  return (
    <button 
      onClick={onClick}
      className="button button--export"
      disabled={disabled}
    >
      <FiDownload />
      {label}
    </button>
  );
}; 