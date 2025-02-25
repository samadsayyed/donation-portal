import React from 'react';
import BackButton from '../common/BackButton';
import PaymentForm from './PaymentForm';

const PaymentSection = ({ amount, setAmount, onBack, onPaymentComplete }) => {
  return (
    <div className="space-y-6">
      <BackButton onClick={onBack} />
      <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
      <PaymentForm 
        amount={amount}
        setAmount={setAmount}
        onPaymentComplete={onPaymentComplete}
      />
    </div>
  );
};

export default PaymentSection;