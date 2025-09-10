import { ReactNode } from "react";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export default function AdminPageHeader({
  title,
  description,
  action,
  className = ""
}: AdminPageHeaderProps) {
  return (
    <div className={`mb-8 flex justify-between items-center ${className}`}>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
        {description && <p className="text-gray-600">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
