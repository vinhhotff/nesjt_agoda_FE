interface ResultsSummaryProps {
  totalItems: number;
  currentItemsCount: number;
  currentPage: number;
  className?: string;
}

export default function ResultsSummary({
  totalItems,
  currentItemsCount,
  currentPage,
  className = ""
}: ResultsSummaryProps) {
  return (
    <div className={`mb-4 ${className}`}>
      <p className="text-gray-400 text-sm">
        {totalItems === 0 
          ? 'No menu items found' 
          : `Showing ${currentItemsCount} of ${totalItems} items`
        }
        {currentPage > 1 && ` (Page ${currentPage})`}
      </p>
    </div>
  );
}
