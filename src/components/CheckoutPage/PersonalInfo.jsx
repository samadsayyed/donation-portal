import React, { useState } from "react";
import { CreditCard } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchCountriesList } from "../../api/countiesApi";
import { PAFPopup } from "./PafPopup";



const PersonalInfo = ({ donation, setDonation }) => {
  const [showPopup, setShowPopup] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDonation((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [name]: value },
    }));
  };

  

  const { data: countries = [] } = useQuery({
    queryKey: ["countries"],
    queryFn: fetchCountriesList,
    refetchInterval: 300000,
  });

  const dummyAddresses = [
    "221B Baker Street, London NW1 6XE",
    "10 Downing Street, London SW1A 2AA",
    "Buckingham Palace, London SW1A 1AA",
  ];

  const handleSelectAddress = (address) => {
    setDonation((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, address1: address },
    }));
    setShowPopup(false);
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h2 className="text-xl font-semibold mb-6 text-black">Personal Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {["title", "firstName", "lastName", "phone", "email", "postcode", "city", "address1", "address2"].map((field, index) => (
          <div key={index}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{field.replace(/([A-Z])/g, ' $1').trim()}</label>
            <input
              type="text"
              name={field}
              value={donation.personalInfo[field] || ""}
              onChange={handleChange}
              className="w-full rounded-lg border-gray-200 h-10 px-3 focus:ring-black focus:border-black"
              placeholder={`Enter your ${field}`}
            />
          </div>
        ))}

        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select a Country</label>
          <select
            name="country"
            value={donation.personalInfo.country || ""}
            onChange={handleChange}
            className="w-full rounded-lg border-gray-200 h-10 px-3 focus:ring-black focus:border-black"
          >
            <option value="">Select Country</option>
            {countries.map((item) => (
              <option key={item.country_id} value={item.country_id}>
                {item.country_name}
              </option>
            ))}
          </select>
        </div>

        {/* Post Code / ZIP & PAF Button */}
        <div className="relative flex items-center gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Post Code / ZIP</label>
            <input
              type="text"
              name="postcode"
              value={donation.personalInfo.postcode || ""}
              onChange={handleChange}
              className="w-full rounded-lg border-gray-200 h-10 px-3 focus:ring-black focus:border-black"
              placeholder="Enter your postal code"
            />
          </div>
          {donation.personalInfo.country === "1" && (
            <button
              className="mt-6 bg-black text-white px-4 py-2 rounded-lg"
              onClick={() => setShowPopup(true)}
            >
              PAF
            </button>
          )}
        </div>
      </div>

      {/* Payment Method */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
        <div className="border rounded-lg p-4 inline-block">
          <CreditCard className="text-gray-900" size={32} />
        </div>
      </div>

      {/* PAF Popup Component */}
      <PAFPopup show={showPopup} setDonation={setDonation} postcode={donation.personalInfo.postcode} onSelect={handleSelectAddress} donation={donation} onClose={() => setShowPopup(false)} />
    </div>
  );
};

export default PersonalInfo;
