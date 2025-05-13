import React from 'react';

const DonationCard = ({ title, description, onClick }) => (
  <div
    onClick={onClick}
    className="cursor-pointer rounded-xl  bg-primary border border-gray-200 p-6 transition-all hover:border-customBeige  hover:-translate-y-1"
  >
    <h3 className="text-lg font-semibold text-white select-none">{title}</h3>
    {/* <p className="mt-2 text-sm text-gray-600">{description}</p> */}
  </div>
);

export default DonationCard; 