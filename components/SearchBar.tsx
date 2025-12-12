'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const router = useRouter();
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Debounce search queries (300ms delay)
    if (query.length > 2) {
      debounceTimer.current = setTimeout(() => {
        fetch(`/api/tools?search=${encodeURIComponent(query)}`)
          .then(res => res.json())
          .then(data => setSuggestions(data.slice(0, 5)))
          .catch(() => setSuggestions([]));
      }, 300);
    } else {
      setSuggestions([]);
    }

    // Cleanup timer on unmount
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/tools?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="relative w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search AI tools..."
          className="w-full px-4 py-3 pl-12 pr-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </form>
      
      {suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-64 overflow-y-auto">
          {suggestions.map((tool) => (
            <button
              key={tool.id}
              onClick={() => {
                router.push(`/tools/${tool.slug}`);
                setQuery('');
              }}
              className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 focus:bg-blue-50 dark:focus:bg-gray-700 focus:outline-none"
            >
              <div className="font-medium text-gray-900 dark:text-white">{tool.name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{tool.description}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
