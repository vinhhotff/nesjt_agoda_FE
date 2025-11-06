import { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  showHeader?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  showHeader = true,
  size = 'md',
  className = ""
}: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl'
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-lg shadow-lg w-full mx-4 ${sizeClasses[size]} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {showHeader && (
          <div className="flex items-center justify-between p-4 border-b">
            {title && <h2 className="text-lg font-semibold">{title}</h2>}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              &times;
            </button>
          </div>
        )}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
