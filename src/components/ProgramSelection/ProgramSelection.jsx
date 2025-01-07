import React from 'react';
import DonationCard from '../common/DonationCard';
import SkeletonCard from '../Loading/SkeletonCard';
import ErrorMessage from '../Error/ErrorMessage';
import usePrograms from '../../hooks/usePrograms';
import BackButton from '../common/BackButton';
import SearchableList from '../common/SearchableList';

const ProgramSelection = ({ category, onSelect, onBack }) => {
  const { programs, loading, error } = usePrograms(category);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      );
    }

    if (error) {
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
