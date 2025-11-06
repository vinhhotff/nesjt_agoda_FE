import { ReactNode } from "react";

interface FilterLayoutProps {
  filters: ReactNode;
  content: ReactNode;
  className?: string;
}

export default function FilterLayout({ 
  filters, 
  content, 
  className = "" 
}: FilterLayoutProps) {
  return (
    <div className={`flex gap-6 ${className}`}>
      {/* Filter Sidebar */}
      <div className="w-64 flex-shrink-0">
        <div className="sticky top-4 space-y-6">
          {filters}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {content}
      </div>
    </div>
  );
}
