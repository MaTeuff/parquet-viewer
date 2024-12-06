import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Column } from '../types/types';
import { HeaderCell } from './HeaderCell';
import { TableCell } from './TableCell';
import { ColumnCell } from '../types/types';

interface ReactTableProps {
  data: Record<string, string>[];
  columns: Column[];
  setData: React.Dispatch<React.SetStateAction<Record<string, string>[]>>;
}

export function ReactTable({ data, columns, setData }: ReactTableProps) {
  // Handlers
  const handleCellEdit = (rowIndex: number, columnId: string, value: string) => {
    setData(old =>
      old.map((row, index) =>
        index === rowIndex ? { ...row, [columnId]: value } : row
      )
    );
  };

  const handleHeaderEdit = (oldHeader: string, newHeader: string) => {
    if (!newHeader.trim()) {
      return;
    }

    setData(old => old.map(row => {
      if (!(oldHeader in row)) return row;

      const newRow = { ...row };
      newRow[newHeader] = newRow[oldHeader];
      delete newRow[oldHeader];
      return newRow;
    }));
  };

  // Transform the simple column structure into TanStack table columns
  const tableColumns: ColumnDef<Record<string, string>>[] = columns
    .sort((a, b) => a.order - b.order)
    .map(column => ({
      header: () => (
        <HeaderCell
          value={column.key}
          onEdit={(newValue) => handleHeaderEdit(column.key, newValue)}
        />
      ),
      accessorKey: column.key,
      cell: (props) => (
        <TableCell
          cellProps={props as ColumnCell}
          onEdit={handleCellEdit}
          value={props.getValue()?.toString() ?? ''}
        />
      )
    }));

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
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
  );
}