import React from 'react';

interface PaginationProps {
  current: number;
  total: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ current, total, onPageChange }) => {
  const pageNumbers = [];

  for (let i = 1; i <= total; i++) {
    pageNumbers.push(i);
  }

  if (total <= 1) return null;

  return (
    <div className="flex justify-center items-center mt-4 space-x-2">
      <button
        disabled={current === 1}
        onClick={() => onPageChange(current - 1)}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Prev
      </button>

      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 border rounded ${
            page === current ? 'bg-black text-white' : ''
          }`}
        >
          {page}
        </button>
      ))}

      <button
        disabled={current === total}
        onClick={() => onPageChange(current + 1)}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
