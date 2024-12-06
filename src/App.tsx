import { useEffect, useState } from 'react';
import { useReactTable, getCoreRowModel, flexRender, ColumnDef } from '@tanstack/react-table';
import * as arrow from 'apache-arrow';
import initWasm, {
  Compression,
  Table,
  writeParquet,
  WriterPropertiesBuilder,
  readParquet,
} from 'parquet-wasm';
import { TableCell } from './components/TableCell';
import { ColumnCell } from './types/types';
import './App.css';

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

  const exportToCSV = () => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => Object.values(item).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'table-export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToParquet = async () => {
    try {
      if (data.length === 0) return;

      const arrowData: Record<string, string[]> = {};
      Object.keys(data[0]).forEach(key => {
        arrowData[key] = data.map(row => row[key]);
      });

      const table = arrow.tableFromArrays(arrowData);
      const wasmTable = Table.fromIPCStream(arrow.tableToIPC(table, 'stream'));
      const writerProperties = new WriterPropertiesBuilder()
        .setCompression(Compression.ZSTD)
        .build();
      const parquetUint8Array = writeParquet(wasmTable, writerProperties);

      const blob = new Blob([parquetUint8Array], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'table-export.parquet';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting to Parquet:', error);
      alert('Error exporting to Parquet. Check console for details.');
    }
  };

  const importParquet = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const parquetTable = readParquet(uint8Array);
      const arrowTable = arrow.tableFromIPC(parquetTable.intoIPCStream());

      const importedData: Record<string, string>[] = [];
      const columnNames = arrowTable.schema.fields.map(f => f.name);

      for (let i = 0; i < arrowTable.numRows; i++) {
        const row: Record<string, string> = {};
        columnNames.forEach(colName => {
          row[colName] = arrowTable.getChild(colName)?.get(i)?.toString() || '';
        });
        importedData.push(row);
      }

      setData(importedData);
      return importedData;
    } catch (error) {
      console.error('Import error:', error);
      throw error;
    }
  };

  const importCSV = async (file: File) => {
    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(header => header.trim());
      
      const importedData: Record<string, string>[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue; // Skip empty lines
        
        const values = lines[i].split(',').map(value => value.trim());
        const row: Record<string, string> = {};
        
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        
        importedData.push(row);
      }

      setData(importedData);
      return importedData;
    } catch (error) {
      console.error('CSV import error:', error);
      throw error;
    }
  };

  const handleParquetSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    importParquet(file)
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
      .catch(error => {
        console.error('Error importing CSV file:', error);
        alert('Error importing CSV file. Check console for details.');
      })
      .finally(() => {
        setIsLoading(false);
        event.target.value = '';
      });
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
          onClick={exportToCSV} 
          className="export-button"
          disabled={isLoading}
        >
          Export as CSV
        </button>
        <button 
          onClick={exportToParquet} 
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
