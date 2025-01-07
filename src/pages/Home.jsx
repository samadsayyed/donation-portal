import React, { useEffect } from 'react';

import useLocalStorage from '../hooks/useLocalStorage';
import CategorySelection from '../components/CategorySelection/CategorySelection';
import ProgramSelection from '../components/ProgramSelection/ProgramSelection';
import PaymentSection from '../components/PaymentSection/PaymentSection';

const DonationPortal = () => {
  // Use custom hook for all state that needs to persist
  const [step, setStep] = useLocalStorage('donationStep', 1);
  const [selectedCategory, setSelectedCategory] = useLocalStorage('selectedCategory', '');
  const [selectedProgram, setSelectedProgram] = useLocalStorage('selectedProgram', '');
  const [amount, setAmount] = useLocalStorage('donationAmount', '');

  // Reset all stored data when payment is completed
  const resetDonation = () => {
    setStep(1);
    setSelectedCategory('');
    setSelectedProgram('');
    setAmount('');
    localStorage.removeItem('donationStep');
    localStorage.removeItem('selectedCategory');
    localStorage.removeItem('selectedProgram');
    localStorage.removeItem('donationAmount');
  };

console.log(selectedCategory,"selectedCategory");


  // Optional: Clean up localStorage when component unmounts
  useEffect(() => {
    return () => {
      // Uncomment if you want to clear data when user leaves the page
      // resetDonation();
    };
  }, []);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setStep(2);
  };

  const handleProgramSelect = (program) => {
    setSelectedProgram(program);
    setStep(3);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handlePaymentComplete = () => {
    // Handle successful payment
    console.log('Payment completed:', {
      category: selectedCategory,
      program: selectedProgram,
      amount
    });
    resetDonation();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl bg-white/90 backdrop-blur-sm shadow-xl p-8">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Make a Difference</h1>
            <p className="text-gray-600">Your contribution can change lives</p>
            
         
          </header>

          {step === 1 && (
            <CategorySelection 
              selectedCategory={selectedCategory}
              onSelect={handleCategorySelect}
            />
          )}
          
          {step === 2 && (
            <ProgramSelection 
              category={selectedCategory}
              selectedProgram={selectedProgram}
              onSelect={handleProgramSelect}
              onBack={handleBack}
            />
          )}
          
          {step === 3 && (
            <PaymentSection 
              amount={amount}
              setAmount={setAmount}
              onBack={handleBack}
              onPaymentComplete={handlePaymentComplete}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DonationPortal;