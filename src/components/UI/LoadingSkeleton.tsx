import React from 'react';

export const PetCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden animate-pulse">
      <div className="h-2 bg-gray-200 dark:bg-gray-700"></div>
      <div className="p-4 flex gap-4">
        <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        </div>
      </div>
    </div>
  );
};

export const MapSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden animate-pulse">
      <div className="p-4 border-b dark:border-gray-700">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
      </div>
      <div className="h-96 bg-gray-200 dark:bg-gray-700"></div>
    </div>
  );
};