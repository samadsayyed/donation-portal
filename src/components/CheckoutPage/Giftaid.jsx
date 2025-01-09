import React, { useState, useEffect } from 'react';

const Giftaid = () => {
  const [giftAid, setGiftAid] = useState({
    giftAid: "N",
  });

  // Load gift aid preference from local storage on mount
  useEffect(() => {
    const storedPreference = JSON.parse(
      localStorage.getItem("giftAidPreference")
    );
    if (storedPreference) {
      setGiftAid(storedPreference);
    }
  }, []);

  // Save preference to local storage with expiration
  const savePreferenceToLocalStorage = (updatedPreference) => {
    const now = new Date();
    const expiry = now.getTime() + 24 * 60 * 60 * 1000; // 1 day from now
    localStorage.setItem(
      "giftAidPreference",
      JSON.stringify({
        ...updatedPreference,
        expiry,
      })
    );
  };

  // Handle checkbox change
  const handleGiftAidChange = (event) => {
    const { checked } = event.target;
    const updatedPreference = {
      giftAid: checked ? "Y" : "N",
    };
    setGiftAid(updatedPreference);
    savePreferenceToLocalStorage(updatedPreference);
  };

  return (
    <div className="bg-gray-100 shadow-md border text-black md:p-8 p-2 rounded-2xl mb-6">
      <div className="flex flex-col md:flex-row justify-center items-start md:items-center mb-8">
        {/* <h2 className="text-3xl font-semibold mb-4 md:mb-0">Gift aid</h2> */}
        <img
          src="/giftaid-logo-black.png"
          alt="Gift Aid Logo"
          className="h-12 object-contain"
        />
      </div>

      <div className="space-y-6">
        <p className="text-lg leading-relaxed">
          If you are a UK taxpayer, the value of your gift can be increased by
          25% under the Gift Aid schema at no extra cost to you. With Gift
          Aid, your donation will be worth more, and it doesn't cost you a
          penny.
        </p>
<div className="bg-white p-2 rounded-xl text-black text-center">  <p className="text-xl font-medium">
          Your donation of every £1.00 can become £1.25
        </p></div>
      

        <div className="mt-8">
        <button className="mb-4 md:mt-0 mt-5 bg-white w-full mx-auto p-4 text-left border border-gray-500 rounded-xl">

          <label className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="giftAidEligible"
              checked={giftAid.giftAid === "Y"}
              onChange={handleGiftAidChange}
              className="w-10 h-10 accent-[#02343F] align-middle border-2 border-black rounded-sm"
            />
            <span className="text-lg text-black">
              I am a UK taxpayer and would like Charity to reclaim tax
              on all donations I have made within the last four years and all
              donations that I make hereafter.
            </span>
          </label>
          </button>
        </div>

        <p className="text-sm opacity-80 mt-4">
          I understand that if I pay less Income Tax and/or Capital Gains tax
          than the amount of Gift Aid claimed on all my donations by all the
          charities or Community Amateur Sports Clubs (CASCs) that I donate to
          will reclaim on my gifts for that tax (6 April to 5 April), it is my
          responsibility to pay any difference.
        </p>
      </div>
    </div>
  );
};

export default Giftaid;