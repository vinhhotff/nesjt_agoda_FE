import { Payment, Guest } from '@/src/Types';
import { FC } from 'react';

interface PaymentListProps {
  payments: Payment[];
  onEdit: (payment: Payment) => void;
  onDelete: (id: string) => void;
}

const PaymentList: FC<PaymentListProps> = ({ payments, onEdit, onDelete }) => {
  const renderGuest = (guest: string | Guest) => {
    if (typeof guest === "string") return guest; // là id
    return guest.guestName || guest.phoneNumber || "Unknown Guest"; // là object
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-white rounded-lg shadow-md">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-3 text-left">Guest</th>
            <th className="py-2 px-3 text-left">Amount</th>
            <th className="py-2 px-3 text-left">Method</th>
            <th className="py-2 px-3 text-left">Status</th>
            <th className="py-2 px-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((row) => (
            <tr key={row._id} className="border-t hover:bg-gray-50">
              <td className="py-2 px-3">{renderGuest(row.guest)}</td>
              <td className="py-2 px-3">${row.amount}</td>
              <td className="py-2 px-3 capitalize">{row.method}</td>
              <td className="py-2 px-3">
                {row.status || (
                  <span className="text-gray-400 italic">n/a</span>
                )}
              </td>
              <td className="py-2 px-3 text-center">
                <button
                  className="text-blue-700 hover:underline mr-3"
                  onClick={() => onEdit(row)}
                >
                  Edit
                </button>
                <button
                  className="text-red-600 hover:underline"
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
  );
};

export default PaymentList;
