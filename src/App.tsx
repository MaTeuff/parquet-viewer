import { useEffect, useState } from 'react';
import { useReactTable, getCoreRowModel, flexRender, ColumnDef } from '@tanstack/react-table';
import initWasm from 'parquet-wasm';
import { TableCell } from './components/TableCell';
import { ColumnCell } from './types/types';
import './App.css';
import { exportToCSV, exportToParquet, importParquet, importCSV } from './utils/fileHandlers';

const generateInitialData = () => [{
  field1: 'Sample Value 1',
  field2: 'Sample Value 2',
}];

function App() {
  const [wasmReady, setWasmReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<Record<string, string>[]>(generateInitialData());
  const [columns, setColumns] = useState<ColumnDef<Record<string, string>>[]>([]);

  useEffect(() => {
    initWasm()
      .then(() => setWasmReady(true))
      .catch(error => console.error('WASM initialization failed:', error));
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      const newColumns: ColumnDef<Record<string, string>>[] = Object.keys(data[0]).map(key => ({
        header: key,
        accessorKey: key,
        cell: (props) => (
          <TableCell
            cellProps={props as ColumnCell}
            onEdit={handleCellEdit}
          />
        )
      }));
      setColumns(newColumns);
    }
  }, [data]);

  const handleCellEdit = (rowIndex: number, columnId: string, value: string) => {
    setData(old =>
      old.map((row, index) => {
        if (index === rowIndex) {
          return {
            ...row,
            [columnId]: value,
          };
        }
        return row;
      })
    );
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

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

  const handleExportToCSV = () => {
    try {
      exportToCSV(data);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      alert('Error exporting to CSV. Check console for details.');
    }
  };

  const handleExportToParquet = async () => {
    try {
      await exportToParquet(data);
    } catch (error) {
      console.error('Error exporting to Parquet:', error);
      alert('Error exporting to Parquet. Check console for details.');
    }
  };

  return (
    <div className="container">
      <h1>Parquet Viewer and Editor</h1>
      <div className="button-group">
        <label 
          className="import-button" 
          style={{ opacity: wasmReady && !isLoading ? 1 : 0.5 }}
        >
          {isLoading ? 'Importing...' : 'Import Parquet'}
          <input
            type="file"
            accept=".parquet"
            onChange={handleParquetSelect}
            disabled={!wasmReady || isLoading}
            style={{ display: 'none' }}
          />
        </label>
        <label 
          className="import-button" 
          style={{ opacity: !isLoading ? 1 : 0.5 }}
        >
          {isLoading ? 'Importing...' : 'Import CSV'}
          <input
            type="file"
            accept=".csv"
            onChange={handleCSVSelect}
            disabled={isLoading}
            style={{ display: 'none' }}
          />
        </label>
        <button 
          onClick={handleExportToCSV} 
          className="export-button"
          disabled={isLoading}
        >
          Export as CSV
        </button>
        <button 
          onClick={handleExportToParquet} 
          className="export-button"
          disabled={!wasmReady || isLoading}
        >
          Export as Parquet
        </button>
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
