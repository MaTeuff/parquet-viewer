import { exportToCSV, exportToParquet } from '../utils/fileHandlers';

export const useExportHandlers = () => {
  const handleExportToCSV = (data: Record<string, string>[]) => {
    try {
      exportToCSV(data);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      alert('Error exporting to CSV. Check console for details.');
    }
  };

  const handleExportToParquet = async (data: Record<string, string>[]) => {
    try {
      await exportToParquet(data);
    } catch (error) {
      console.error('Error exporting to Parquet:', error);
      alert('Error exporting to Parquet. Check console for details.');
    }
  };

  return {
    handleExportToCSV,
    handleExportToParquet
  };
}; 