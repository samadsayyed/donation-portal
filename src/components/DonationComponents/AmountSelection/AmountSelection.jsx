import React, { useState } from 'react';
import BackButton from '../common/BackButton';
import DonationCard from '../common/DonationCard';
import ErrorMessage from '../Error/ErrorMessage';
import SkeletonCard from '../Loading/SkeletonCard';
import { useQuery } from '@tanstack/react-query';
import { fetchProgramRate } from '../../../api/programsApi';

const AmountSelection = ({ onBack, prevData, onSelect,handleAmountSelect,setStep }) => {
  const { selectedCategory, selectedCountry, selectedProgram } = prevData;

  const [customAmount, setCustomAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [amountError, setAmountError] = useState('');

  

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['programRate', selectedCategory, selectedCountry, selectedProgram],
    queryFn: () => fetchProgramRate(selectedCategory, selectedCountry, selectedProgram),
    staleTime: 50 * 60 * 1000,
    refetchInterval: 50 * 60 * 1000,
  });

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setCustomAmount(value);
      setAmountError('');
    }
  };

  const country = localStorage.getItem('selectedCountry');

  

  return (
    <div className="space-y-6">
      <BackButton onClick={!country ? onBack : () => {setStep(2)
        console.log("bak clickwed");
        
      }} />
      <h2 className="text-2xl font-bold text-gray-900">Select or Enter an Amount</h2>

      {/* 🔄 Loading State */}
      {isLoading && (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* ❌ Error State */}
      {isError && <ErrorMessage message={error?.message || 'Failed to load program rate.'} />}

      {/* ✅ Data Loaded */}
      {!isLoading && !isError && (
        <div className="space-y-6">
          {/* Fixed Amount Option */}
          {data?.program_rate && (
            <div
              onClick={() => {
                setSelectedAmount(data.program_rate);
                setAmountError('');
              }}
              className={`${selectedAmount == data.program_rate.program_rate?"border-blue-500":""} cursor-pointer rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-blue-500 hover:shadow-lg hover:-translate-y-1`}
            >
              <h3 className="text-lg font-semibold text-gray-900 select-none">{data.program_rate.program_rate}</h3>
              {/* <p className="mt-2 text-sm text-gray-600">{description}</p> */}
            </div>
          )}

          {/* Custom Amount Input (Always Visible) */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Or enter custom amount (£)
            </label>
            <input
              type="text"
              value={customAmount}
              onChange={handleCustomAmountChange}
              placeholder="e.g. 50"
              className={`w-full p-3 rounded-lg border ${amountError ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-gray-500`}
            />
            {amountError && <p className="text-red-500 text-sm">{amountError}</p>}
          </div>

          {/* Confirm Button */}
          <button
            onClick={()=>handleAmountSelect(customAmount || data.program_rate.program_rate)}
            disabled={!selectedAmount && !customAmount}
            className={`w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors ${!selectedAmount && !customAmount ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            Confirm Amount
          </button>
        </div>
      )}
    </div>
  );
};

export default AmountSelection;
