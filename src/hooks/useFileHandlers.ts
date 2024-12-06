import { useState, useEffect } from 'react';
import initWasm from 'parquet-wasm';
import { importParquet, importCSV } from '../utils/fileHandlers';

interface UseFileHandlersProps {
  setData: (data: Record<string, string>[]) => void;
  setColumnOrder: (columns: string[]) => void;
}

export const useFileHandlers = ({ setData, setColumnOrder }: UseFileHandlersProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [wasmReady, setWasmReady] = useState(false);

  useEffect(() => {
    initWasm()
      .then(() => setWasmReady(true))
      .catch(error => console.error('WASM initialization failed:', error));
  }, []);

  const handleParquetSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    importParquet(file)
      .then(importedData => {
        setData(importedData);
        if (importedData.length > 0) {
          setColumnOrder(Object.keys(importedData[0]));
        }
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
        if (importedData.length > 0) {
          setColumnOrder(Object.keys(importedData[0]));
        }
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
    wasmReady,
    handleParquetSelect,
    handleCSVSelect
  };
}; 