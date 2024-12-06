import { useState } from 'react';
import { importParquet, importCSV } from '../utils/fileHandlers';

interface UseFileHandlersProps {
  setData: (data: Record<string, string>[]) => void;
}

export const useFileHandlers = ({ setData }: UseFileHandlersProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleParquetSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    importParquet(file)
      .then(importedData => {
        setData(importedData);
      })
      .catch(error => {
        console.error('Error importing Parquet file:', error);
        alert('Error importing Parquet file. Check console for details.');
      })
      .finally(() => {
        setIsLoading(false);
        event.target.value = '';
      });
  };

  const handleCSVSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    importCSV(file)
      .then(importedData => {
        setData(importedData);
      })
      .catch(error => {
        console.error('Error importing CSV file:', error);
        alert('Error importing CSV file. Check console for details.');
      })
      .finally(() => {
        setIsLoading(false);
        event.target.value = '';
      });
  };

  return {
    isLoading,
    handleParquetSelect,
    handleCSVSelect
  };
}; 