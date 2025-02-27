import React, { useState, useEffect } from "react";
import { CreditCard, Banknote } from "lucide-react";
import { PAFPopup } from "./PafPopup";
import { userFields, addressFields, titleOptions } from "../../utils/data";

const PersonalInfo = ({ donation, setDonation, countries, paymentGateway, setPaymentGateway }) => {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (!donation.paymentMethod) {
      setDonation((prev) => ({ ...prev, paymentMethod: "stripe" }));
    }
  }, [donation.paymentMethod, setDonation]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDonation((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [name]: value },
    }));
  };

  const handleSelectAddress = (address) => {
    setDonation((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, address1: address },
    }));
    setShowPopup(false);
  };

  const handleSelectPaymentGateway = (gateway) => {
    setPaymentGateway(gateway);
    setDonation((prev) => ({ ...prev, paymentMethod: gateway }));
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h2 className="text-xl font-semibold mb-6 text-black">Personal Details</h2>

      {/* User Information Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <select
            name="title"
            value={donation.personalInfo.title || ""}
            onChange={handleChange}
            className="w-full rounded-lg border h-10 px-3 appearance-none cursor-pointer border-gray-200 focus:ring-black focus:border-black"
          >
            <option value="">Select Title</option>
            {titleOptions.map((title) => (
              <option key={title} value={title}>{title}</option>
            ))}
          </select>
        </div>

        {/* Other User Fields */}
        {userFields.map(({ name, label }) => (
          name !== "title" && (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type="text"
                name={name}
                value={donation.personalInfo[name] || ""}
                onChange={handleChange}
                className="w-full rounded-lg border h-10 px-3 border-gray-200 focus:ring-black focus:border-black"
                placeholder={`Enter your ${label.toLowerCase()}`}
              />
            </div>
          )
        ))}
      </div>

      {/* Address Section */}
      <h2 className="text-xl font-semibold mt-8 mb-4 text-black">Address Details</h2>

      {/* Country & Postcode in the same row */}
      <div className="flex gap-4 items-end">
        {/* Country Selection */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
          <select
            name="country"
            value={donation.personalInfo.country || ""}
            onChange={handleChange}
            className="w-full rounded-lg border h-10 px-3 appearance-none cursor-pointer border-gray-200 focus:ring-black focus:border-black"
          >
            <option value="">Select Country</option>
            {countries.map(({ country_id, country_name }) => (
              <option key={country_id} value={country_id}>{country_name}</option>
            ))}
          </select>
        </div>

        {/* Postcode Input & PAF Button */}
        <div className="flex gap-2 flex-1">
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Post Code / ZIP</label>
            <input
              type="text"
              name="postcode"
              value={donation.personalInfo.postcode || ""}
              onChange={handleChange}
              className="w-full rounded-lg border h-10 px-3 border-gray-200 focus:ring-black focus:border-black"
              placeholder="Enter your postal code"
            />
          </div>

          {/* PAF Button - Only visible if Country ID is 1 */}
          {donation.personalInfo.country === "1" && (
            <button
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors mt-6"
              onClick={() => setShowPopup(true)}
            >
              PAF
            </button>
          )}
        </div>
      </div>

      {/* Other Address Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {addressFields.map(({ name, label }) => (
          name !== "country" && name !== "postcode" && (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type="text"
                name={name}
                value={donation.personalInfo[name] || ""}
                onChange={handleChange}
                className="w-full rounded-lg border h-10 px-3 border-gray-200 focus:ring-black focus:border-black"
                placeholder={`Enter your ${label.toLowerCase()}`}
              />
            </div>
          )
        ))}
      </div>

      {/* Payment Gateway Selection */}
      <div className="mt-8">
        <label className="block text-sm font-medium text-gray-700 mb-3">Payment Gateway</label>
        <div className="flex flex-wrap gap-4">
          {["stripe", "paypal"].map((gateway) => (
            <div
              key={gateway}
              onClick={() => handleSelectPaymentGateway(gateway)}
              className={`border rounded-lg p-4 flex items-center gap-3 cursor-pointer transition-all hover:bg-gray-50 ${donation.paymentMethod === gateway
                ? "border-black ring-1 ring-black bg-gray-50"
                : "border-gray-200"
              }`}
            >
              {gateway === "stripe" ? <CreditCard size={24} className="text-gray-900" /> : <Banknote size={24} className="text-gray-900" />}
              <span className="font-medium capitalize">{gateway}</span>
            </div>
          ))}
        </div>
      </div>

      {/* PAF Popup Component */}
      <PAFPopup
        show={showPopup}
        setDonation={setDonation}
        postcode={donation.personalInfo.postcode}
        onSelect={handleSelectAddress}
        donation={donation}
        onClose={() => setShowPopup(false)}
      />
    </div>
  );
};

export default PersonalInfo;
