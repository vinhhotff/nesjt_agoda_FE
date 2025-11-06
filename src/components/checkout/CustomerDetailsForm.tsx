import FormField from "../ui/FormField";
import Input from "../ui/Input";

interface CustomerDetailsFormProps {
  name: string;
  phone: string;
  onNameChange: (name: string) => void;
  onPhoneChange: (phone: string) => void;
  user?: {
    name?: string;
    email?: string;
  } | null;
}

export default function CustomerDetailsForm({
  name,
  phone,
  onNameChange,
  onPhoneChange,
  user
}: CustomerDetailsFormProps) {
  return (
    <div className="space-y-4">
      {user ? (
        <p className="text-sm text-gray-600">
          Placing order as: <strong>{user.name}</strong> ({user.email})
        </p>
      ) : (
        <p className="text-sm text-gray-600">
          Please provide your details to place the order.
        </p>
      )}
      
      <FormField label="Your Name" required>
        <Input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          required
          disabled={!!user}
          placeholder="Enter your full name"
        />
      </FormField>

      <FormField label="Phone Number" required>
        <Input
          type="tel"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          required
          placeholder="Enter your phone number"
        />
      </FormField>
    </div>
  );
}
