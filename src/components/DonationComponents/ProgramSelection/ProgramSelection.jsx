import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import React, { useState } from 'react';
import { fetchPrograms } from '../../../api/programsApi';
import DonationCard from '../common/DonationCard';
import SearchableList from '../common/SearchableList';
import ErrorMessage from '../Error/ErrorMessage';
import SkeletonCard from '../Loading/SkeletonCard';

const ProgramSelection = ({ category, onBack, setStep, setSelectedProgram, setSelectedCountry }) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['programs', category],
    queryFn: fetchPrograms,
    staleTime: 50 * 60 * 1000,
    refetchInterval: 50 * 60 * 1000,
  });

  const programs = data?.program;

  const handleSelect = (program) => {
    setSelectedProgram(program.program_id);
    // Skip country selection if program has no countries or is local
    setSelectedCountry("")
    setStep(4);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      );
    }

    if (isError) {
      return (
        <div className="flex justify-center items-center min-h-[400px]">
          <ErrorMessage
            message={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <SearchableList
          items={programs}
          renderItem={(program) => (
            <div
              className="transform transition-all duration-200 hover:scale-[1.02]"
              key={program.program_id}
            >
              <DonationCard
                title={program.program_name}
                description={program.description}
                onClick={() => handleSelect(program)}
                className="h-full bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200"
              />
            </div>
          )}
          searchKey="program_name"
          placeholder="Search programs..."
          className="w-full"
          searchInputClassName="w-full px-4 py-3 pl-12 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
          searchIconClassName="absolute left-4 top-3.5 text-gray-400"
          SearchIcon={Search}
        />
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-grey">Select a Donation</h2>
        </div>
      </div>
      {renderContent()}
    </div>
  );
};

export default ProgramSelection;