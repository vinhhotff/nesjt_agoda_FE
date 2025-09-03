'use client';

interface Props {
  page: number;
  total: number;
  limit: number;
  onPageChange: (p: number) => void;
}

export default function Pagination({ page, total, limit, onPageChange }: Props) {
  const totalPages = Math.ceil(total / limit);

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`
            px-4 py-2 rounded-md font-medium transition
            ${p === page 
              ? 'bg-yellow-500 text-white shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-yellow-100 hover:text-yellow-600'}
          `}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
