"use client";
import React from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
  disabled = false
}) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg 
          className="h-5 w-5 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg 
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
          disabled:bg-gray-100 disabled:cursor-not-allowed
          dark:bg-gray-800 dark:border-gray-600 dark:text-white
          dark:focus:ring-blue-400 dark:focus:border-blue-400
        `}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default SearchInput;
