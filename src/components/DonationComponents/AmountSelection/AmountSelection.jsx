import React, { useState } from 'react';
import BackButton from '../common/BackButton';
import ErrorMessage from '../Error/ErrorMessage';
import SkeletonCard from '../Loading/SkeletonCard';
import { useQuery } from '@tanstack/react-query';
import { fetchProgramRate } from '../../../api/programsApi';

const AmountSelection = ({ onBack, prevData, handleAmountSelect, setStep }) => {
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

  const predefinedAmounts = [10, 20, 50, 100]; // ✅ Predefined price options

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setCustomAmount(value);
      setSelectedAmount(null); // Deselect predefined amounts when custom input is used
      setAmountError('');
    }
  };

  const handleAmountClick = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount(''); // Clear custom input if selecting a predefined amount
    setAmountError('');
  };

  const handleConfirm = () => {
    if (!selectedAmount && !customAmount) {
      setAmountError('Please select or enter an amount.');
      return;
    }
    handleAmountSelect(selectedAmount || customAmount);
  };

  const country = localStorage.getItem('selectedCountry');

  return (
    <div className="space-y-4">
      <BackButton onClick={!country ? onBack : () => setStep(2)} />
      <h2 className="text-xl font-bold text-gray-900">Select or Enter an Amount</h2>

      {/* 🔄 Loading State */}
      {isLoading && (
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* ❌ Error State */}
      {isError && <ErrorMessage message={error?.message || 'Failed to load program rate.'} />}

      {/* ✅ Data Loaded */}
      {!isLoading && !isError && (
        <div className="space-y-4">
          {/* Fixed Amount Options - More Compact Grid */}
          <div className="grid grid-cols-4 gap-2">
            {predefinedAmounts.map((amount) => (
              <div
                key={amount}
                onClick={() => handleAmountClick(amount)}
                className={`cursor-pointer rounded-lg border p-3 text-center transition-all ${
                  selectedAmount === amount ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                } hover:border-blue-500 hover:bg-blue-50`}
              >
                <span className="font-semibold text-gray-900 select-none">£{amount}</span>
              </div>
            ))}
          </div>

          {/* Custom Amount Input - More Compact */}
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-500">£</span>
              <input
                type="text"
                value={customAmount}
                onChange={handleCustomAmountChange}
                placeholder="Custom amount"
                className={`flex-1 py-2 px-3 rounded-r-lg border ${
                  amountError ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-1 focus:ring-gray-500`}
              />
            </div>
            {amountError && <p className="text-red-500 text-xs">{amountError}</p>}
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            disabled={!selectedAmount && !customAmount}
            className={`w-full bg-gray-900 text-white py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors ${
              !selectedAmount && !customAmount ? 'opacity-50 cursor-not-allowed' : ''
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