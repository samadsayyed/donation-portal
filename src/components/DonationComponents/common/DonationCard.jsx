import React from 'react';

const DonationCard = ({ title, description, onClick }) => (
  <div
    onClick={onClick}
    className="cursor-pointer rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-secondary hover:shadow-lg hover:-translate-y-1"
  >
    <h3 className="text-lg font-semibold text-gray-900 select-none">{title}</h3>
    {/* <p className="mt-2 text-sm text-gray-600">{description}</p> */}
  </div>
);

export default DonationCard;