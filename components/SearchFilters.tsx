'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, ArrowUpDown, X } from 'lucide-react';

type SortOption = 'popularity' | 'name' | 'newest' | 'oldest';
type FilterOption = 'all' | 'free' | 'paid' | 'freemium';

export default function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  useEffect(() => {
    setMounted(true);
    // Get initial values from URL
    const sort = searchParams.get('sort') as SortOption;
    const pricing = searchParams.get('pricing') as FilterOption;
    if (sort) setSortBy(sort);
    if (pricing) setFilterBy(pricing);
  }, [searchParams]);

  const handleSort = (sort: SortOption) => {
    setSortBy(sort);
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', sort);
    router.push(`/tools?${params.toString()}`);
  };

  const handleFilter = (filter: FilterOption) => {
    setFilterBy(filter);
    const params = new URLSearchParams(searchParams.toString());
    if (filter === 'all') {
      params.delete('pricing');
    } else {
      params.set('pricing', filter);
    }
    router.push(`/tools?${params.toString()}`);
  };

  const clearFilters = () => {
    setSortBy('popularity');
    setFilterBy('all');
    router.push('/tools');
  };

  const hasActiveFilters = sortBy !== 'popularity' || filterBy !== 'all';

  if (!mounted) return null;

  return (
    <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center gap-2">
        <ArrowUpDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort:</span>
        <select
          value={sortBy}
          onChange={(e) => handleSort(e.target.value as SortOption)}
          className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="popularity">Most Popular</option>
          <option value="name">Name (A-Z)</option>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</span>
        <div className="flex gap-2">
          <button
            onClick={() => handleFilter('all')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filterBy === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleFilter('free')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filterBy === 'free'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Free
          </button>
          <button
            onClick={() => handleFilter('freemium')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filterBy === 'freemium'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Freemium
          </button>
          <button
            onClick={() => handleFilter('paid')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              filterBy === 'paid'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Paid
          </button>
        </div>
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="ml-auto flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
          Clear Filters
        </button>
      )}
    </div>
  );
}

