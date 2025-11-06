interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  direction?: 'horizontal' | 'vertical';
}

export default function RadioGroup({
  name,
  options,
  value,
  onChange,
  className = "",
  direction = 'vertical'
}: RadioGroupProps) {
  const containerClasses = direction === 'horizontal' 
    ? "flex gap-4" 
    : "space-y-2";

  return (
    <div className={`${containerClasses} ${className}`}>
      {options.map((option) => (
        <label key={option.value} className="flex items-center cursor-pointer">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            disabled={option.disabled}
            className="mr-2 text-yellow-500 focus:ring-yellow-500"
          />
          <span className={`${option.disabled ? 'text-gray-400' : 'text-gray-700'}`}>
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );
}
