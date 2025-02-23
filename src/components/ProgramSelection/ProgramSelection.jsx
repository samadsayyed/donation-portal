import React from 'react';
import DonationCard from '../common/DonationCard';
import SkeletonCard from '../Loading/SkeletonCard';
import ErrorMessage from '../Error/ErrorMessage';
import BackButton from '../common/BackButton';
import SearchableList from '../common/SearchableList';
import { useQuery } from '@tanstack/react-query';
import { fetchPrograms } from '../../api/programsApi';

const ProgramSelection = ({ category, onSelect, onBack }) => {

  

  const {data,isLoading,isError} = useQuery({
    queryKey: ['programs',category],
    queryFn: fetchPrograms,
    staleTime: 50 * 60 * 1000, // Consider data fresh for 50 minutes
    refetchInterval: 50 * 60 * 1000, // Auto-refetch every 50 minutes
  });

  const programs = data?.program

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

    return (
      <SearchableList
        items={programs}
        renderItem={(program) => (
          <DonationCard
            key={program.program_id}
            title={program.program_name}
            description={program.description}
            onClick={() => onSelect(program.program_id)}
          />
        )}
        searchKey="program_name"
        placeholder="Search programs..."
      />
    );
  };

  return (
    <div className="space-y-6">
      <BackButton onClick={onBack} />
      <h2 className="text-2xl font-bold text-gray-900">Select a Program</h2>
      {renderContent()}
    </div>
  );
};

export default ProgramSelection;
