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

    const newColumns: Column[] = Object.keys(data[0]).map((key, index) => ({
      key,
      order: index
    }));
    
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
