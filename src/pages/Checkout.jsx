import React, { useState } from "react";
import DonationCart from "../components/CheckoutPage/DonationCart";
import GiftAid from "../components/CheckoutPage/Giftaid";
import PersonalInfo from "../components/CheckoutPage/PersonalInfo";
import StepIndicator from "../components/CheckoutPage/StepIndicator";
import { useQuery } from "@tanstack/react-query";
import { getCart } from "../api/cartApi";
import useSessionId from "../hooks/useSessionId";

const DonationWizard = () => {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState({
    giftAid: false,
    email: false,
    phone: false,
    post: false,
    sms: false,
  });
  const [donation, setDonation] = useState({
    items: [{ id: 1, name: "Camel Sadaqah", amount: 90, quantity: 1 }],
    giftAid: false,
    personalInfo: {
      title: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
    address: { country: "", postCode: "", city: "", line1: "", line2: "" },
  });
  const sessionId = useSessionId();


  

  const getCurrentStep = () => {
    switch (step) {
      case 1:
        return <DonationCart setDonation={setDonation} />;
      case 2:
        return <GiftAid donation={donation} setDonation={setDonation} preferences={preferences} setPreferences={setPreferences} />;
      case 3:
        return <PersonalInfo donation={donation} setDonation={setDonation} />;
      default:
        return <DonationCart donation={donation} setDonation={setDonation} />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <StepIndicator step={step} />
      {getCurrentStep()}
      <div className="mt-6 flex justify-between">
        <button
          onClick={() => setStep(step - 1)}
          disabled={step === 1}
          className={`px-6 py-2 rounded-lg ${
            step === 1
              ? "bg-gray-100 text-gray-400"
              : "bg-gray-100 text-gray-900 hover:bg-gray-200"
          }`}
        >
          Previous
        </button>
        <button
          onClick={() => setStep(step + 1)}
          disabled={step === 3}
          className={`px-6 py-2 rounded-lg ${
            step === 3
              ? "bg-gray-100 text-gray-400"
              : "bg-black text-white hover:bg-gray-900"
          }`}
        >
          {step === 3 ? "Submit" : "Next"}
        </button>
      </div>
    </div>
  );
};

export default DonationWizard;
