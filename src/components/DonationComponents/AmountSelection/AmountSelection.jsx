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
    <div className="space-y-6">
      <BackButton onClick={!country ? onBack : () => setStep(2)} />
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
          {/* Fixed Amount Options */}
          <div className="grid grid-cols-2 gap-4">
            {predefinedAmounts.map((amount) => (
              <div
                key={amount}
                onClick={() => handleAmountClick(amount)}
                className={`cursor-pointer rounded-xl border p-6 transition-all ${
                  selectedAmount === amount ? 'border-blue-500 shadow-lg' : 'border-gray-200'
                } hover:border-blue-500 hover:shadow-lg`}
              >
                <h3 className="text-lg font-semibold text-gray-900 select-none">£{amount}</h3>
              </div>
            ))}
          </div>

          {/* Custom Amount Input */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Or enter a custom amount (£)
            </label>
            <input
              type="text"
              value={customAmount}
              onChange={handleCustomAmountChange}
              placeholder="e.g. 50"
              className={`w-full p-3 rounded-lg border ${
                amountError ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-gray-500`}
            />
            {amountError && <p className="text-red-500 text-sm">{amountError}</p>}
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            disabled={!selectedAmount && !customAmount}
            className={`w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors ${
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
