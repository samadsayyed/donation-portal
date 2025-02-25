import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { fetchCategories } from '../../../api/categoryApi';
import DonationCard from '../common/DonationCard';
import SearchableList from '../common/SearchableList';
import ErrorMessage from '../Error/ErrorMessage';
import SkeletonCard from '../Loading/SkeletonCard';

const CategorySelection = ({ onSelect }) => {
  const {data:categories,isLoading,isError} = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 50 * 60 * 1000, // Consider data fresh for 50 minutes
    refetchInterval: 50 * 60 * 1000, // Auto-refetch every 50 minutes
  });
  

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      );
    }

    if (isError) {
      return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
    }

    if (categories.length === 0) {
      return (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-gray-700">
          <p>No categories available at the moment.</p>
        </div>
      );
    }

    return (
      <SearchableList
        items={categories}
        renderItem={(category) => (
          <DonationCard
            key={category.category_id}
            title={category.category_name}
            onClick={() => onSelect(category.category_id)}
          />
        )}
        searchKey="category_name"
        placeholder="Search categories..."
      />
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Choose a Category</h2>
      {renderContent()}
    </div>
  );
};

export default CategorySelection;
