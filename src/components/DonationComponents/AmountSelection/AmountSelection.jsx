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

  const predefinedAmounts = [10, 20, 50, 100, 200]; // ✅ Predefined price options

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

      <div className="space-y-6">
        {/* Fixed Amount Options - More Compact Grid */}
        <div className="grid grid-cols-4 md:grid-cols-5 gap-2">
          {predefinedAmounts.map((amount) => (
            <div
              key={amount}
              onClick={() => handleAmountClick(amount)}
              className={`cursor-pointer rounded-lg border p-3 text-center transition-all ${
                selectedAmount === amount ? 'border-secondary bg-secondary text-primary' : 'bg-primary text-white'
              } hover:border-primary`}
            >
              <span className={`font-semibold text-gray-900 select-none ${selectedAmount === amount ? " " : "text-white"}`}>£{amount}</span>
            </div>
          ))}
        </div>

        {/* Enhanced Custom Amount Input */}
        <div className="space-y-2">
          <label htmlFor="customAmount" className="block text-sm font-medium text-gray-700">
            Or enter a custom amount:
          </label>
          <div className="relative">
            <div className="flex shadow-md rounded-lg overflow-hidden">
              <span className="px-4 py-3 bg-gray-100 border border-r-0 border-gray-300 text-gray-500 font-bold">£</span>
              <input
                id="customAmount"
                type="text"
                value={customAmount}
                onChange={handleCustomAmountChange}
                placeholder="Enter your preferred amount"
                className={`flex-1 py-3 px-4 border-2 ${
                  customAmount ? 'border-secondary bg-secondary/10' : amountError ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent text-lg`}
              />
            </div>
            {amountError && <p className="text-red-500 text-xs mt-1">{amountError}</p>}
          </div>
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleConfirm}
          disabled={!selectedAmount && !customAmount}
          className={`w-full bg-primary text-white py-3 rounded-lg font-semibold text-lg hover:bg-primaryHover transition-colors ${
            !selectedAmount && !customAmount ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Confirm Amount
        </button>
      </div>
    </div>
  );
};

export default AmountSelection;