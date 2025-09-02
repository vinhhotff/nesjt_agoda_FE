import { FC, useState } from 'react';

interface Guest {
  guestName?: string;
}

interface Order {
  guest?: Guest | string;
  status?: 'pending' | 'preparing' | 'served' | 'cancelled';
}

interface OrderFormModalProps {
  initial?: Order;
  onSubmit: (data: { guest: string; status: string }) => void;
  onClose: () => void;
}

const OrderFormModal: FC<OrderFormModalProps> = ({ initial, onSubmit, onClose }) => {
  const [guest, setGuest] = useState(
    typeof initial?.guest === 'string' ? initial.guest : initial?.guest?.guestName || ''
  );
  const [status, setStatus] = useState<Order['status']>(
    (initial?.status as Order['status']) || 'pending'
  );

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-lg p-6 sm:p-8 animate-fadeIn">
        {/* Title */}
        <h2 className="font-semibold text-xl text-gray-800 mb-6 text-center">
          {initial ? '✏️ Edit Order' : '🆕 New Order'}
        </h2>

        {/* Guest Input */}
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-gray-700">Guest</label>
          <input
            value={guest}
            onChange={(e) => setGuest(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-800"
            placeholder="Enter guest name"
            required
          />
        </div>

        {/* Status Select */}
        <div className="mb-6">
          <label className="block mb-1 text-sm font-medium text-gray-700">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Order['status'])}
            className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-800"
          >
            <option value="pending">⏳ Pending</option>
            <option value="preparing">👨‍🍳 Preparing</option>
            <option value="served">🍽️ Served</option>
            <option value="cancelled">❌ Cancelled</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <button
            className="px-5 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition"
            onClick={() => onSubmit({ guest, status: status || 'pending' })}
          >
            {initial ? 'Update' : 'Create'}
          </button>
          <button
            className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderFormModal;