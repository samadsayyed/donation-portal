import React from 'react';

const PaymentButton = ({ icon, text }) => (
  <button
    type="button"
    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center transition-all hover:border-blue-500 hover:shadow-md"
  >
    {icon} {text}
  </button>
);

export default PaymentButton;