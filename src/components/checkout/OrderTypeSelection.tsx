import { OrderType } from "@/src/Types";
import FormField from "../ui/FormField";
import RadioGroup from "../ui/RadioGroup";
import Input from "../ui/Input";

interface OrderTypeSelectionProps {
  orderType: OrderType;
  deliveryAddress: string;
  onOrderTypeChange: (type: OrderType) => void;
  onDeliveryAddressChange: (address: string) => void;
}

export default function OrderTypeSelection({
  orderType,
  deliveryAddress,
  onOrderTypeChange,
  onDeliveryAddressChange
}: OrderTypeSelectionProps) {
  const orderTypeOptions = [
    { value: OrderType.PICKUP, label: "Pickup" },
    { value: OrderType.DELIVERY, label: "Delivery" }
  ];

  return (
    <div className="space-y-4">
      <FormField label="Order Type" required>
        <RadioGroup
          name="orderType"
          options={orderTypeOptions}
          value={orderType}
          onChange={(value) => onOrderTypeChange(value as OrderType)}
          direction="horizontal"
        />
      </FormField>

      {orderType === OrderType.DELIVERY && (
        <FormField label="Delivery Address" required>
          <Input
            type="text"
            value={deliveryAddress}
            onChange={(e) => onDeliveryAddressChange(e.target.value)}
            required
            placeholder="Enter your delivery address"
          />
        </FormField>
      )}
    </div>
  );
}
