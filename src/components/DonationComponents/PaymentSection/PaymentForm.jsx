import React from 'react';
import PaymentButton from './PaymentButton';

const PaymentForm = ({ amount, setAmount, onPaymentComplete }) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Add your payment processing logic here
      await processPayment(amount);
      onPaymentComplete();
    } catch (error) {
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
      <div className="space-y-2">
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Donation Amount
        </label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
        />
      </div>
      
      <div className="space-y-4">
        <PaymentButton icon="💳" text="Pay with Card" />
        <PaymentButton icon="📱" text="Digital Wallet" />
      </div>
    </form>
  );
};

export default PaymentForm;