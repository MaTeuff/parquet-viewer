import { useState, useEffect } from 'react';
import { useReactTable, getCoreRowModel, flexRender, ColumnDef } from '@tanstack/react-table';
import './App.css';
import { TableCell } from './components/TableCell';
import { ColumnCell } from './types/types';
import { ImportButton } from './components/ImportButton';
import { ExportButton } from './components/ExportButton';
import { ThemeToggle } from './components/ThemeToggle';
import { useFileHandlers } from './hooks/useFileHandlers';
import { useExportHandlers } from './hooks/useExportHandlers';
import { HeaderCell } from './components/HeaderCell';

const generateInitialData = () => [{
  field1: 'Sample Value 1',
  field2: 'Sample Value 2',
}];

function App() {
  const [data, setData] = useState<Record<string, string>[]>(generateInitialData());
  const [columns, setColumns] = useState<ColumnDef<Record<string, string>>[]>([]);
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const { isLoading, wasmReady, handleParquetSelect, handleCSVSelect } = useFileHandlers({ 
    setData, 
    setColumnOrder 
  });
  const { handleExportToCSV, handleExportToParquet } = useExportHandlers();

  const handleHeaderEdit = (oldHeader: string, newHeader: string) => {
    setColumnOrder(order => order.map(key => key === oldHeader ? newHeader : key));
    
    setData(old => old.map(row => {
      const newRow = { ...row };
      if (oldHeader in newRow) {
        newRow[newHeader] = newRow[oldHeader];
        delete newRow[oldHeader];
      }
      return newRow;
    }));
  };

  useEffect(() => {
    if (data.length > 0) {
      if (columnOrder.length === 0) {
        setColumnOrder(Object.keys(data[0]));
      }

      const newColumns: ColumnDef<Record<string, string>>[] = columnOrder.map(key => ({
        header: () => (
          <HeaderCell
            value={key}
            onEdit={(newValue) => handleHeaderEdit(key, newValue)}
          />
        ),
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
  }, [data, columnOrder]);

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
