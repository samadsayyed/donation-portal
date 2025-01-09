import React, { useState, useEffect } from "react";
import Giftaid from "./Giftaid";

const Contact = () => {
  const [preferences, setPreferences] = useState({
    selectAll: false,
    email: "N",
    phone: "N",
    post: "N",
    sms: "N",
  });

  useEffect(() => {
    const storedPreferences = JSON.parse(
      localStorage.getItem("contactPreferences")
    );
    if (storedPreferences) {
      // Check if all preferences are "Y" to set selectAll
      const allSelected = Object.entries(storedPreferences)
        .filter(([key]) => key !== "selectAll" && key !== "expiry")
        .every(([, value]) => value === "Y");

      setPreferences({
        ...storedPreferences,
        selectAll: allSelected,
      });
    }
  }, []);

  const savePreferencesToLocalStorage = (updatedPreferences) => {
    const now = new Date();
    const expiry = now.getTime() + 24 * 60 * 60 * 1000; // 1 day from now
    localStorage.setItem(
      "contactPreferences",
      JSON.stringify({
        ...updatedPreferences,
        expiry,
      })
    );
  };

  const handleCheckboxChange = (event) => {
    const { id, checked } = event.target;
    const updatedPreferences = {
      ...preferences,
      [id]: checked ? "Y" : "N",
    };

    // Update selectAll based on all other checkboxes
    if (id !== "selectAll") {
      const allSelected = Object.entries(updatedPreferences)
        .filter(([key]) => key !== "selectAll" && key !== "expiry")
        .every(([, value]) => value === "Y");
      updatedPreferences.selectAll = allSelected;
    }

    setPreferences(updatedPreferences);
    savePreferencesToLocalStorage(updatedPreferences);
  };

  const handleSelectAll = (event) => {
    const { checked } = event.target;
    const newValue = checked ? "Y" : "N";
    const updatedPreferences = {
      selectAll: checked,
      email: newValue,
      phone: newValue,
      post: newValue,
      sms: newValue,
    };
    setPreferences(updatedPreferences);
    savePreferencesToLocalStorage(updatedPreferences);
  };

  return (

      <div className="bg-gray-100 shadow-md  text-black md:p-8 p-2 rounded-2xl">
        <h3 className="text-xl font-semibold mb-6">Stay up-to-date by:</h3>
        <div className="flex md:flex-row flex-wrap justify-center gap-4 mb-4 text-black">
          <button className="mb-4 md:mt-0 mt-5 bg-white max-w-xl mx-auto p-4 text-center border border-gray-500 rounded-xl">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="email"
                checked={preferences.email === "Y"}
                onChange={handleCheckboxChange}
                className="w-6 h-6 accent-[#02343F] align-middle border-2 border-black rounded-sm"
              />
              <span>Email</span>
            </label>
          </button>

          <button className="mb-4 md:mt-0 mt-5 bg-white max-w-xl mx-auto p-4 text-center border border-gray-500 rounded-xl">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="phone"
                checked={preferences.phone === "Y"}
                onChange={handleCheckboxChange}
                className="w-6 h-6 accent-[#02343F] align-middle border-2 border-black rounded-sm"
              />
              <span>Phone</span>
            </label>
          </button>

          <button className="mb-4 md:mt-0 mt-5 bg-white max-w-xl mx-auto p-4 text-center border border-gray-500 rounded-xl">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="post"
                checked={preferences.post === "Y"}
                onChange={handleCheckboxChange}
                className="w-6 h-6 accent-[#02343F] align-middle border-2 border-black rounded-sm"
              />
              <span>Post</span>
            </label>
          </button>

          <button className="mb-4 md:mt-0 mt-5 bg-white max-w-xl mx-auto p-4 text-center border border-gray-500 rounded-xl">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="sms"
                checked={preferences.sms === "Y"}
                onChange={handleCheckboxChange}
                className="w-6 h-6 accent-[#02343F] align-middle border-2 border-black rounded-sm"
              />
              <span>SMS</span>
            </label>
          </button>

          <button className="mb-4 md:mt-0 mt-5 bg-white w-full md:max-w-xl mx-auto p-4 text-center border border-gray-500 rounded-xl">
            <label className="flex items-center justify-center space-x-3">
              <input
                type="checkbox"
                id="selectAll"
                checked={preferences.selectAll}
                onChange={handleSelectAll}
                className="w-6 h-6 accent-[#02343F] align-middle border-2 border-black rounded-sm"
              />
              <span className="text-md font-medium text-[#02343F]">
                Select All Mode
              </span>
            </label>
          </button>
        </div>

        <p className="text-lg mt-6 text-center">
          You can opt out any time by contacting us on 020 XX XXXXX or emailing
          us at My Sadaqah Online.
        </p>
      </div>
  );
};

export default Contact;
