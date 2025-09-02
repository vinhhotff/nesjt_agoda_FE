import { Table } from '@/src/Types';
import { FC } from 'react';

interface TableListProps {
  tables: Table[];
  onEdit: (table: Table) => void;
  onDelete: (id: string) => void;
}

const statusColors: Record<string, string> = {
  available: "bg-green-100 text-green-700",
  occupied: "bg-red-100 text-red-700",
  reserved: "bg-yellow-100 text-yellow-700",
  unavailable: "bg-gray-200 text-gray-600",
};

const TableList: FC<TableListProps> = ({ tables, onEdit, onDelete }) => (
  <div className="w-full">
    {/* Desktop Table */}
    <div className="hidden md:block">
      <table className="w-full bg-white rounded-lg shadow overflow-hidden">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-3 px-4 text-left">Name</th>
            <th className="py-3 px-4 text-left">Status</th>
            <th className="py-3 px-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tables.map((row) => (
            <tr key={row._id} className="border-t hover:bg-gray-50">
              <td className="py-3 px-4 font-medium">{row.tableName}</td>
              <td className="py-3 px-4">
                <span
                  className={`px-2 py-1 text-sm rounded-full ${
                    statusColors[row.status] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  {row.status}
                </span>
              </td>
              <td className="py-3 px-4 text-center">
                <button
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 mr-2"
                  onClick={() => onEdit(row)}
                >
                  Edit
                </button>
                <button
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
                  onClick={() => onDelete(row._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Mobile Cards */}
    <div className="grid gap-4 md:hidden">
      {tables.map((row) => (
        <div
          key={row._id}
          className="bg-white shadow rounded-lg p-4 flex flex-col gap-2"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">{row.tableName}</h3>
            <span
              className={`px-2 py-1 text-sm rounded-full ${
                statusColors[row.status] || "bg-gray-100 text-gray-700"
              }`}
            >
              {row.status}
            </span>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
              onClick={() => onEdit(row)}
            >
              Edit
            </button>
            <button
              className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
              onClick={() => onDelete(row._id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default TableList;
