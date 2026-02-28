import * as XLSX from 'xlsx';

interface AdminProps {
  coordinadores: unknown[];
  setCoordinadores: (data: unknown[]) => void;
  baseUrl: string;
  publicAnonKey: string;
  cargarDatos: () => void;
  camareros: unknown[];
  pedidos: unknown[];
}

const exportCSV = (data: unknown[], filename: string) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, filename);
};

export const Admin = ({ pedidos, camareros }: AdminProps) => {
  const handleExport = () => {
    exportCSV([...pedidos, ...camareros], 'admin-export.csv');
  };

  return (
    <div>
      <button onClick={handleExport}>Export</button>
    </div>
  );
};

export default Admin;
