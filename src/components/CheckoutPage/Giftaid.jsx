import React, { useState } from "react";
import { Mail, Phone, MessageSquare, Mailbox } from "lucide-react";

const CompactGiftAid = ({preferences, setPreferences}) => {


  const toggleAll = (checked) => {
    setPreferences((prev) => ({
      ...prev,
      email: checked,
      phone: checked,
      post: checked,
      sms: checked,
    }));
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-4 rounded-lg border border-gray-200">
      {/* Gift Aid Section */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
        <div className="flex-1">
          <h2 className="font-semibold text-gray-900">
            Boost your donation by 25%
          </h2>
          <p className="text-sm text-gray-600">
            UK taxpayer? Get Gift Aid at no extra cost
          </p>
        </div>
        <label className="flex items-center gap-2 ml-4">
          <input
            type="checkbox"
            checked={preferences.giftAid}
            onChange={(e) =>
              setPreferences((prev) => ({ ...prev, giftAid: e.target.checked }))
            }
            className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
          />
          <span className="text-sm font-medium">Add Gift Aid</span>
        </label>
      </div>

      {/* Communication Preferences */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm font-medium text-gray-900 mb-2">
          <span>Stay updated via:</span>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              onChange={(e) => toggleAll(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
            />
            <span className="text-sm">Select all</span>
          </label>
        </div>

        <div className="grid grid-cols-4 gap-2">
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
              className={`flex flex-col items-center p-3 rounded-lg border-[1px] border-gray-300 cursor-pointer transition-all duration-200 
      ${
        preferences[key]
          ? "border-blue-600 shadow-sm shadow-blue-600 bg-blue-50"
          : "bg-gray-50 hover:bg-gray-100"
      }`}
            >
              <Icon
                size={20}
                className={`mb-1 transition-colors duration-200 ${
                  preferences[key] ? "text-blue-600" : "text-gray-600"
                }`}
              />
              <span className="text-xs font-medium text-gray-700">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Legal Text */}
      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <p>
          By checking Gift Aid, I confirm I am a UK taxpayer and understand I
          must pay Income/Capital Gains Tax equal to the Gift Aid claimed.
        </p>
        <p>
          We protect your data and use it to meet your communication
          preferences. See our Privacy Policy for details.
        </p>
        <p className="text-xs text-gray-400">
          Contact info@technoservesolutions.com to update preferences
        </p>
      </div>
    </div>
  );
};

export default CompactGiftAid;
