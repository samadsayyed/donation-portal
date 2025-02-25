import React from 'react';
import DonationCard from '../common/DonationCard';
import SkeletonCard from '../Loading/SkeletonCard';
import ErrorMessage from '../Error/ErrorMessage';
import BackButton from '../common/BackButton';
import SearchableList from '../common/SearchableList';
import { useQuery } from '@tanstack/react-query';
import { fetchCountries } from '../../../api/countiesApi';

const CountrySelection = ({ category, onSelect, onBack,setStep }) => {

  

  const {data,isLoading,isError,error} = useQuery({
    queryKey: ['counties',category],
    queryFn: fetchCountries,
    staleTime: 50 * 60 * 1000, // Consider data fresh for 50 minutes
    refetchInterval: 50 * 60 * 1000, // Auto-refetch every 50 minutes
  });

  const counties = data?.country

  if(counties?.length == 0) setStep(4)

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
        items={counties}
        renderItem={(country) => (
          <DonationCard
            key={country.country_id}
            title={country.country_name}
            description={country.description}
            onClick={() => onSelect(country.country_id)}
          />
        )}
        searchKey="country_name"
        placeholder="Search counties..."
      />
    );
  };

  return (
    <div className="space-y-6">
      <BackButton onClick={onBack} />
      <h2 className="text-2xl font-bold text-gray-900">Select a Country</h2>
      {renderContent()}
    </div>
  );
};

export default CountrySelection;
