import { ReactNode } from "react";

interface AdminTableProps {
  headers: string[];
  children: ReactNode;
  emptyState?: ReactNode;
  loading?: boolean;
  className?: string;
}

export default function AdminTable({
  headers,
  children,
  emptyState,
  loading = false,
  className = ""
}: AdminTableProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="text-left py-4 px-6 font-medium text-gray-900"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {children}
          </tbody>
        </table>

        {emptyState && (
          <div className="text-center py-12">
            {emptyState}
          </div>
        )}
      </div>
    </div>
  );
}
