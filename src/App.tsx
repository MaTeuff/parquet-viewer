import { useState } from 'react'
import './App.css'
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table'

function App() {
  type Car = {
    manufacturer: string
    color: string
    engine: string
  }

  const [data, setData] = useState<Car[]>([
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
  ])

  const handleCellEdit = (rowIndex: number, columnId: string, value: string) => {
    setData(old => 
      old.map((row, index) => {
        if (index === rowIndex) {
          return {
            ...row,
            [columnId]: value,
          }
        }
        return row
      })
    )
  }

  const columns = [
    {
      header: 'Manufacturer',
      accessorKey: 'manufacturer',
      cell: ({ row, column, getValue }: any) => (
        <input
          value={getValue() as string}
          onChange={e => handleCellEdit(row.index, column.id, e.target.value)}
          className="table-cell-input"
        />
      )
    },
    {
      header: 'Color',
      accessorKey: 'color',
      cell: ({ row, column, getValue }: any) => (
        <input
          value={getValue() as string}
          onChange={e => handleCellEdit(row.index, column.id, e.target.value)}
          className="table-cell-input"
        />
      )
    },
    {
      header: 'Engine',
      accessorKey: 'engine',
      cell: ({ row, column, getValue }: any) => (
        <input
          value={getValue() as string}
          onChange={e => handleCellEdit(row.index, column.id, e.target.value)}
          className="table-cell-input"
        />
      )
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const exportToCSV = () => {
    // Create CSV header
    const headers = columns.map(col => col.header).join(',');
    
    // Create CSV rows
    const rows = data.map(item => 
      Object.values(item).join(',')
    ).join('\n');
    
    // Combine headers and rows
    const csv = `${headers}\n${rows}`;
    
    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'table-export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="container">
        <h1>Parquet Viewer and Editor</h1>
        <div className="button-group">
          <button onClick={exportToCSV} className="export-button">
            Export as CSV
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
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
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
    </>
  )
}

export default App
