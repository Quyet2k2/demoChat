'use client';

import React from 'react';

export type FilterType = 'all' | 'unread' | 'read' | 'hidden';

interface MessageFilterProps {
  filterType: FilterType;
  setFilterType: (filter: FilterType) => void;
  counts: {
    all: number;
    unread: number;
    read: number;
    hidden: number;
  };
}

const LABELS: Record<FilterType, string> = {
  all: 'Tất cả',
  unread: 'Chưa đọc',
  read: 'Đã đọc',
  hidden: 'Ẩn trò chuyện',
};

export default function MessageFilter({ filterType, setFilterType, counts }: MessageFilterProps) {
  const filters: FilterType[] =
    counts.hidden && counts.hidden > 0
      ? (['all', 'unread', 'read', 'hidden'] as FilterType[])
      : (['all', 'unread', 'read'] as FilterType[]);

  return (
    <div className="p-2 border-b border-gray-200 flex space-x-2 bg-white overflow-x-auto whitespace-nowrap">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => setFilterType(filter)}
          className={`
            px-3 py-1.5 text-xs rounded-full transition-all font-medium cursor-pointer
            flex items-center gap-1.5 flex-shrink-0
            ${
              filterType === filter ? 'bg-blue-500 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
        >
          <span>{LABELS[filter]}</span>
          <span
            className={`
              text-[0.625rem] px-1.5 py-0.5 rounded-full font-semibold
              ${filterType === filter ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}
            `}
          >
            {counts[filter]}
          </span>
        </button>
      ))}
    </div>
  );
}
