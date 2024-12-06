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
import { Car, ColumnCell } from './types/types';
import './App.css';

const initialData: Car[] = [
  {
    manufacturer: 'Toyota',
    color: 'Red',
    engine: '2.0L 4-cylinder',
  },
  {
    manufacturer: 'BMW',
    color: 'Black',
    engine: '3.0L 6-cylinder',
  },
  {
    manufacturer: 'Tesla',
    color: 'White',
    engine: 'Dual Motor Electric',
  },
];

function App() {
  const [wasmReady, setWasmReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<Car[]>(initialData);

  useEffect(() => {
    initWasm()
      .then(() => setWasmReady(true))
      .catch(error => console.error('WASM initialization failed:', error));
  }, []);

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

  const columns: ColumnDef<Car>[] = [
    {
      header: 'Manufacturer',
      accessorKey: 'manufacturer',
      cell: (props) => <TableCell cellProps={props as ColumnCell} onEdit={handleCellEdit} />
    },
    {
      header: 'Color',
      accessorKey: 'color',
      cell: (props) => <TableCell cellProps={props as ColumnCell} onEdit={handleCellEdit} />
    },
    {
      header: 'Engine',
      accessorKey: 'engine',
      cell: (props) => <TableCell cellProps={props as ColumnCell} onEdit={handleCellEdit} />
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const exportToCSV = () => {
    const headers = columns.map(col => col.header).join(',');
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
      const table = arrow.tableFromArrays({
        manufacturer: data.map(row => row.manufacturer),
        color: data.map(row => row.color),
        engine: data.map(row => row.engine)
      });

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

      const importedData: Car[] = [];
      for (let i = 0; i < arrowTable.numRows; i++) {
        importedData.push({
          manufacturer: arrowTable.getChild('manufacturer')?.get(i)?.toString() || '',
          color: arrowTable.getChild('color')?.get(i)?.toString() || '',
          engine: arrowTable.getChild('engine')?.get(i)?.toString() || ''
        });
      }

      setData(importedData);
      return importedData;
    } catch (error) {
      console.error('Import error:', error);
      throw error;
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading(true);
      importParquet(file)
        .catch(error => {
          console.error('Error importing file:', error);
          alert('Error importing file. Check console for details.');
        })
        .finally(() => setIsLoading(false));
    }
    event.target.value = '';
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
            onChange={handleFileSelect}
            disabled={!wasmReady || isLoading}
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
          disabled={isLoading}
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
