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

  // Effects
  useEffect(() => {
    if (data.length === 0) return;

    if (columns.length === 0) {
      setColumns(Object.keys(data[0]).map((key, index) => ({ key, order: index })));
      return;
    }

    const currentKeys = Object.keys(data[0]);
    const previousKeys = columns.map(col => col.key);

    // If keys are the same, no need to update
    if (currentKeys.length === previousKeys.length &&
      currentKeys.every(key => previousKeys.includes(key))) {
      return;
    }
    console.log(currentKeys, previousKeys);

    // Find added and removed columns
    const addedKeys = currentKeys.filter(key => !previousKeys.includes(key));
    const removedKeys = previousKeys.filter(key => !currentKeys.includes(key));
    console.log(addedKeys, removedKeys);
    console.log(columns);
    let newColumns: Column[] = [];

    if (addedKeys.length > 1 || removedKeys.length > 1) {
      newColumns = currentKeys.map((key, index) => ({ key, order: index }));
    } else if (addedKeys.length === 1 && removedKeys.length === 1) {
      // If exactly one column was replaced, new column takes the order of the removed one
      const removedColumn = columns.find(col => col.key === removedKeys[0])!;
      newColumns = currentKeys.map(key => {
        if (key === addedKeys[0]) {
          return { key, order: removedColumn.order };
        }
        return columns.find(col => col.key === key)!;
      });
    } else {
      // Otherwise, preserve existing orders and add new columns at the end
      const maxOrder = Math.max(...columns.map(col => col.order), -1);
      newColumns = currentKeys.map(key => {
        const existingColumn = columns.find(col => col.key === key);
        return existingColumn || { key, order: maxOrder + 1 };
      });
    }
    console.log(newColumns);
    setColumns(newColumns);
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
