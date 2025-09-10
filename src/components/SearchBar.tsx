import React, { useState, useEffect } from 'react';
import { Search, X, Filter } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  isLoading?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "Search profiles...",
  isLoading = false
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, onSearch]);

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div
        className={`relative flex items-center bg-white border-2 rounded-lg transition-all duration-200 ${
          isFocused 
            ? 'border-blue-500 shadow-lg shadow-blue-100' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <div className="absolute left-3 flex items-center pointer-events-none">
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          ) : (
            <Search className="h-4 w-4 text-gray-400" />
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full pl-10 pr-12 py-3 text-sm bg-transparent border-none outline-none placeholder-gray-400"
        />

        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Suggestions/Tips */}
      {isFocused && !query && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <div className="text-xs text-gray-500 mb-2 font-medium">Search tips:</div>
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex items-center">
              <Filter className="w-3 h-3 mr-2" />
              <span>Search by name, email, location, or bio</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;