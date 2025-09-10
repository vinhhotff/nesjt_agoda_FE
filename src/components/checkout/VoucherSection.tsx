import FormField from "../ui/FormField";
import Input from "../ui/Input";

interface VoucherSectionProps {
  voucherCode: string;
  onVoucherCodeChange: (code: string) => void;
  onApplyVoucher: () => void;
  loading: boolean;
  error?: string | null;
  cartTotal: number;
  discountAmount: number;
  finalTotal: number;
}

export default function VoucherSection({
  voucherCode,
  onVoucherCodeChange,
  onApplyVoucher,
  loading,
  error,
  cartTotal,
  discountAmount,
  finalTotal
}: VoucherSectionProps) {
  return (
    <div className="space-y-4">
      <FormField label="Voucher Code" error={error || undefined}>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter voucher code"
            value={voucherCode}
            onChange={(e) => onVoucherCodeChange(e.target.value)}
            error={!!error}
          />
          <button
            type="button"
            onClick={onApplyVoucher}
            disabled={loading || !voucherCode.trim()}
            className="px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg font-medium hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {loading ? 'Applying...' : 'Apply'}
          </button>
        </div>
      </FormField>

      {/* Order Summary */}
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Subtotal:</span>
          <span>{cartTotal.toLocaleString()} VND</span>
        </div>
        
        {discountAmount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount:</span>
            <span>- {discountAmount.toLocaleString()} VND</span>
          </div>
        )}
        
        <div className="flex justify-between text-lg font-semibold border-t pt-2">
          <span>Final total:</span>
          <span>{finalTotal.toLocaleString()} VND</span>
        </div>
      </div>
    </div>
  );
}
