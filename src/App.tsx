import { useState, useEffect } from 'react';
import './App.css';
import { ImportButton } from './components/ImportButton';
import { ExportButton } from './components/ExportButton';
import { ThemeToggle } from './components/ThemeToggle';
import { useFileHandlers } from './hooks/useFileHandlers';
import { useExportHandlers } from './hooks/useExportHandlers';
import { ReactTable } from './components/ReactTable';
import { Column } from './types/types';

// Constants
const INITIAL_DATA = [{
  'Column 1': '',
  'Column 2': '',
}];

function App() {
  // State
  const [data, setData] = useState<Record<string, string>[]>(INITIAL_DATA);
  const [columns, setColumns] = useState<Column[]>([]);

  // Hooks
  const { isLoading, wasmReady, handleParquetSelect, handleCSVSelect } = useFileHandlers({
    setData,
  });
  const { handleExportToCSV, handleExportToParquet } = useExportHandlers();

  const updateColumnsFromData = (
    currentKeys: string[], 
    previousColumns: Column[]
  ): Column[] => {
    const previousKeys = previousColumns.map(col => col.key);
    
    // Identify added and removed columns
    const addedKeys = currentKeys.filter(key => !previousKeys.includes(key));
    const removedKeys = previousKeys.filter(key => !currentKeys.includes(key));

    // Nothing to do if no columns have changed
    if (addedKeys.length === 0 && removedKeys.length === 0) return previousColumns;

    if (addedKeys.length === 1 && removedKeys.length === 1) {
      // Single column replacement - preserve order
      const removedColumn = previousColumns.find(col => col.key === removedKeys[0])!;
      return currentKeys.map(key => 
        key === addedKeys[0]
          ? { key, order: removedColumn.order }
          : previousColumns.find(col => col.key === key)!
      );
    }

    // Multiple columns changed - reset all column orders
    if (addedKeys.length > 1 || removedKeys.length > 1) {
      return currentKeys.map((key, index) => ({ key, order: index }));
    }

    // Handle added or removed columns while preserving existing orders
    const maxOrder = Math.max(...previousColumns.map(col => col.order), -1);
    return currentKeys.map(key => {
      const existingColumn = previousColumns.find(col => col.key === key);
      return existingColumn || { key, order: maxOrder + 1 };
    });
  };

  useEffect(() => {
    if (data.length === 0) return;

    // Initialize columns if none exist
    if (columns.length === 0) {
      setColumns(Object.keys(data[0]).map((key, index) => ({ key, order: index })));
      return;
    }

    const currentKeys = Object.keys(data[0]);
    const updatedColumns = updateColumnsFromData(currentKeys, columns);
    
    // Only update if columns have changed
    if (updatedColumns !== columns) {
      setColumns(updatedColumns);
    }
  }, [data]);

  return (
    <div className="container">
      <h1>Parquet Viewer and Editor</h1>

      <div className="button-group">
        <ImportButton
          label="Import Parquet"
          accept=".parquet"
          isLoading={isLoading}
          disabled={!wasmReady || isLoading}
          onFileSelect={handleParquetSelect}
        />
        <ImportButton
          label="Import CSV"
          accept=".csv"
          isLoading={isLoading}
          disabled={isLoading}
          onFileSelect={handleCSVSelect}
        />
        <ExportButton
          label="Export as CSV"
          disabled={isLoading}
          onClick={() => handleExportToCSV(data)}
        />
        <ExportButton
          label="Export as Parquet"
          disabled={!wasmReady || isLoading}
          onClick={() => handleExportToParquet(data)}
        />
        <ThemeToggle />
      </div>

      <ReactTable
        data={data}
        columns={columns}
        setData={setData}
      />

    </div>
  );
}

export default App;
