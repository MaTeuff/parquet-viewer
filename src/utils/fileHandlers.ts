import * as arrow from 'apache-arrow';
import {
  Table,
  writeParquet,
  WriterPropertiesBuilder,
  Compression,
  readParquet,
} from 'parquet-wasm';

export const exportToCSV = (data: Record<string, string>[]) => {
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

export const exportToParquet = async (data: Record<string, string>[]) => {
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
};

export const importParquet = async (file: File) => {
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

  return importedData;
};

export const importCSV = async (file: File) => {
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

  return importedData;
}; 