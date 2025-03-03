import React, { useState, useEffect } from "react";
import { Mail, Phone, MessageSquare, Mailbox, Info, AlertCircle, Check } from "lucide-react";

const CompactGiftAid = ({ preferences, setPreferences }) => {
  const [showFeeInfo, setShowFeeInfo] = useState(false);

  // Initialize localStorage on component mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('donationPreferences');
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  // Save to localStorage whenever preferences change
  useEffect(() => {
    localStorage.setItem('donationPreferences', JSON.stringify(preferences));
  }, [preferences]);

  const toggleAll = (checked) => {
    setPreferences((prev) => ({
      ...prev,
      email: checked,
      phone: checked,
      post: checked,
      sms: checked,
    }));
  };

  // Calculate the fee amount based on donation amount (if available)
  const calculateFee = () => {
    if (preferences.donationAmount) {
      return (preferences.donationAmount * 0.0125).toFixed(2);
    }
    return "a small amount";
  };

  return (
    <div className="space-y-4">
      {/* Gift Aid Section */}
      <div className="bg-white border-l-4 border-l-secondary border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-start">
          <div className="bg-secondary bg-opacity-10 p-2 rounded-full mr-3">
            <Check size={20} className="text-secondary" />
          </div>
          <div className="flex-1">
            <h3 className="text-md font-semibold text-primary">
              Boost your donation by 25%
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              UK taxpayer? Add Gift Aid at no extra cost to you
            </p>
            
            <div className="mt-3 flex items-center">
              <input
                type="checkbox"
                id="gift-aid"
                checked={preferences.giftAid}
                onChange={(e) =>
                  setPreferences((prev) => ({ ...prev, giftAid: e.target.checked }))
                }
                className="w-4 h-4 rounded border-gray-300 text-secondary focus:ring-secondary"
              />
              <label htmlFor="gift-aid" className="ml-2 text-sm font-medium">Yes, add Gift Aid to my donation</label>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Fee Section
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="mr-3 mt-1">
            <AlertCircle size={18} className="text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-semibold text-primary">Cover transaction costs</h3>
              <button 
                onClick={() => setShowFeeInfo(!showFeeInfo)}
                className="text-secondary hover:text-secondaryDark focus:outline-none"
                aria-label="Toggle transaction fee information"
              >
                <Info size={16} />
              </button>
            </div>
            
            {showFeeInfo && (
              <div className="mt-2 mb-3 bg-gray-50 border-l-2 border-secondary p-2 rounded text-xs text-gray-700">
                <p>Every transaction incurs a 1.25% processing fee from our payment provider. By covering this fee, you ensure 100% of your intended donation amount reaches those in need.</p>
                <p className="mt-1">For a £100 donation, this would mean adding just £1.25 to cover costs.</p>
              </div>
            )}
            
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="transaction-fee"
                  checked={preferences.coverFee || false}
                  onChange={(e) =>
                    setPreferences((prev) => ({ ...prev, coverFee: e.target.checked }))
                  }
                  className="w-4 h-4 rounded border-gray-300 text-secondary focus:ring-secondary"
                />
                <label htmlFor="transaction-fee" className="ml-2 text-sm">
                  Yes, I'll cover the 1.25% transaction fee 
                  {preferences.donationAmount && (
                    <span className="text-secondary font-medium"> (£{calculateFee()})</span>
                  )}
                </label>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      {/* Communication Preferences */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
          <h3 className="text-md font-semibold mb-1 sm:mb-0">Stay updated via:</h3>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="select-all"
              checked={
                preferences.email &&
                preferences.phone &&
                preferences.post &&
                preferences.sms
              }
              onChange={(e) => toggleAll(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-secondary focus:ring-secondary"
            />
            <label htmlFor="select-all" className="ml-2 text-sm">Select all</label>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Mail, label: "Email", key: "email" },
            { icon: Phone, label: "Phone", key: "phone" },
            { icon: Mailbox, label: "Post", key: "post" },
            { icon: MessageSquare, label: "SMS", key: "sms" },
          ].map(({ icon: Icon, label, key }) => (
            <div
              key={key}
              onClick={() =>
                setPreferences((prev) => ({ ...prev, [key]: !prev[key] }))
              }
              className={`flex flex-col items-center p-3 rounded-lg border ${
                preferences[key]
                  ? "border-secondary bg-secondary bg-opacity-5"
                  : "border-gray-200 bg-gray-50 hover:bg-gray-100"
              } cursor-pointer transition-all duration-200`}
            >
              <Icon size={18} className={preferences[key] ? "text-secondary" : "text-gray-500"} />
              <span className="mt-1 text-sm">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Legal Text */}
      <div className="text-xs text-gray-500 leading-relaxed bg-gray-50 p-3 rounded-lg">
        <p>
          <span className="font-medium">Gift Aid:</span> By checking Gift Aid, I confirm I am a UK taxpayer and understand I must pay Income/Capital Gains Tax equal to the Gift Aid claimed.
        </p>
        <p className="mt-1">
          <span className="font-medium">Communication:</span> We protect your data and only contact you according to your preferences. See our Privacy Policy for details.
        </p>
        <p className="mt-1">
          For any questions or to update your preferences, contact <span className="text-secondary">info@technoservesolutions.com</span>
        </p>
      </div>
    </div>
  );
};

export default CompactGiftAid;