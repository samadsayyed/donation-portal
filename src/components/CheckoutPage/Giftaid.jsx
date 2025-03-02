import React, { useState } from "react";
import { Mail, Phone, MessageSquare, Mailbox } from "lucide-react";

const CompactGiftAid = ({ preferences, setPreferences }) => {
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
    <div className="space-y-6">
      {/* Gift Aid Section */}
      <div className="bg-white border border-secondary rounded-lg p-4 shadow-sm">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-primary flex items-center">
            <span className="text-secondary mr-2">✓</span>
            Boost your donation by 25%
          </h3>
          <p className="text-gray-600">
            UK taxpayer? Get Gift Aid at no extra cost
          </p>
        </div>

        <div className="mt-4 flex items-center space-x-2">
          <input
            type="checkbox"
            id="gift-aid"
            checked={preferences.giftAid}
            onChange={(e) =>
              setPreferences((prev) => ({ ...prev, giftAid: e.target.checked }))
            }
            className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
          />
          <label htmlFor="gift-aid" className="font-medium">Add Gift Aid</label>
        </div>
      </div>

      {/* Communication Preferences */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Stay updated via:</h3>
        
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="select-all"
            checked={
              preferences.email &&
              preferences.phone &&
              preferences.post &&
              preferences.sms
            }
            onChange={(e) =>
              toggleAll(e.target.checked)
            }
            className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
          />
          <label htmlFor="select-all" className="ml-2 font-medium">Select all</label>
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
              className={`flex flex-col items-center p-3 rounded-lg border-[1px] border-gray-300 cursor-pointer transition-all duration-200 
                ${
                  preferences[key]
                    ? "border-secondary shadow-sm shadow-secondary bg-blue-50"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
            >
              <Icon className={preferences[key] ? "text-secondary" : "text-gray-500"} />
              <span className="mt-1">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Legal Text */}
      <div className="space-y-3 text-xs text-gray-500">
        <p>
          By checking Gift Aid, I confirm I am a UK taxpayer and understand I
          must pay Income/Capital Gains Tax equal to the Gift Aid claimed.
        </p>
        <p>
          We protect your data and use it to meet your communication
          preferences. See our Privacy Policy for details.
        </p>
        <p>
          Contact info@technoservesolutions.com to update preferences
        </p>
      </div>
    </div>
  );
};

export default CompactGiftAid;