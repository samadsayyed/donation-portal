import React, { useState } from "react";
import { CreditCard, Banknote, Building } from "lucide-react";
import { PAFPopup } from "./PafPopup";
import { fields } from "../../utils/data";

const PersonalInfo = ({ donation, setDonation, countries, paymentGateway, setPaymentGateway }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

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
    setDonation((prev) => ({
      ...prev,
      paymentMethod: gateway,
    }));
  };

  // Set Stripe as default payment method if not already set
  React.useEffect(() => {
    if (!donation.paymentMethod) {
      setDonation((prev) => ({
        ...prev,
        paymentMethod: "stripe",
      }));
    }
  }, [donation.paymentMethod, setDonation]);

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h2 className="text-xl font-semibold mb-6 text-black">Personal Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map(({ name, label }) => (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
              type="text"
              name={name}
              value={donation.personalInfo[name] || ""}
              onChange={handleChange}
              onFocus={() => setFocusedField(name)}
              onBlur={() => setFocusedField(null)}
              className={`w-full rounded-lg border h-10 px-3 transition-all duration-200 ${focusedField === name
                  ? "border-black ring-2 ring-gray-200 bg-gray-50"
                  : "border-gray-200 focus:ring-black focus:border-black"
                }`}
              placeholder={`Enter your ${label.toLowerCase()}`}
            />
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select a Country</label>
          <div className="relative">
            <select
              name="country"
              value={donation.personalInfo.country || ""}
              onChange={handleChange}
              onFocus={() => setFocusedField("country")}
              onBlur={() => setFocusedField(null)}
              className={`w-full rounded-lg border h-10 px-3 appearance-none cursor-pointer ${focusedField === "country"
                  ? "border-black ring-2 ring-gray-200 bg-gray-50"
                  : "border-gray-200 focus:ring-black focus:border-black"
                }`}
            >
              <option value="">Select Country</option>
              {countries.map(({ country_id, country_name }) => (
                <option key={country_id} value={country_id}>{country_name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>

        {donation.personalInfo.country === "1" && (
          <div className="relative flex items-center gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Post Code / ZIP</label>
              <input
                type="text"
                name="postcode"
                value={donation.personalInfo.postcode || ""}
                onChange={handleChange}
                onFocus={() => setFocusedField("postcode")}
                onBlur={() => setFocusedField(null)}
                className={`w-full rounded-lg border h-10 px-3 transition-all duration-200 ${focusedField === "postcode"
                    ? "border-black ring-2 ring-gray-200 bg-gray-50"
                    : "border-gray-200 focus:ring-black focus:border-black"
                  }`}
                placeholder="Enter your postal code"
              />
            </div>
            <button
              className="mt-6 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              onClick={() => setShowPopup(true)}
            >
              PAF
            </button>
          </div>
        )}
      </div>

      <div className="mt-8">
        <label className="block text-sm font-medium text-gray-700 mb-3">Payment Gateway</label>
        <div className="flex flex-wrap gap-4">
          <div
            onClick={() => handleSelectPaymentGateway("stripe")}
            className={`border rounded-lg p-4 flex items-center gap-3 cursor-pointer transition-all hover:bg-gray-50 ${donation.paymentMethod === "stripe" ? "border-black ring-1 ring-black bg-gray-50" : "border-gray-200"
              }`}
          >
            <CreditCard className="text-gray-900" size={24} />
            <span className="font-medium">Stripe</span>
            {/* {donation.paymentMethod === "stripe" && (
              <span className="ml-2 bg-black text-white text-xs px-2 py-1 rounded-full">Default</span>
            )} */}
          </div>

          {/* <div
            onClick={() => handleSelectPaymentGateway("paypal")}
            className={`border rounded-lg p-4 flex items-center gap-3 cursor-pointer transition-all hover:bg-gray-50 ${donation.paymentMethod === "paypal" ? "border-black ring-1 ring-black bg-gray-50" : "border-gray-200"
              }`}
          >
            <Banknote className="text-gray-900" size={24} />
            <span className="font-medium">PayPal</span>
          </div>

          <div
            onClick={() => handleSelectPaymentGateway("bank")}
            className={`border rounded-lg p-4 flex items-center gap-3 cursor-pointer transition-all hover:bg-gray-50 ${donation.paymentMethod === "bank" ? "border-black ring-1 ring-black bg-gray-50" : "border-gray-200"
              }`}
          >
            <Building className="text-gray-900" size={24} />
            <span className="font-medium">Bank Transfer</span>
          </div> */}
        </div>
      </div>

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