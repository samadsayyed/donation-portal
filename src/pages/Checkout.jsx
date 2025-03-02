import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import DonationCart from "../components/CheckoutPage/DonationCart";
import GiftAid from "../components/CheckoutPage/Giftaid";
import PersonalInfo from "../components/CheckoutPage/PersonalInfo";
import StepIndicator from "../components/CheckoutPage/StepIndicator";
import { fetchCountriesList } from "../api/countiesApi";
import { generateReferenceId } from "../utils/functions";
import { cartTransaction } from "../api/cartApi";
import useSessionId from "../hooks/useSessionId";
import StripePayment from "../components/CheckoutPage/StripePayment";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import toast from "react-hot-toast";
import PayPalPayment from "../components/CheckoutPage/PayPalPayment";
import { requiredFields } from "../utils/data";


const DonationWizard = () => {
  const [step, setStep] = useState(1);

  const [preferences, setPreferences] = useState({
    giftAid: false,
    email: false,
    phone: false,
    post: false,
    sms: false,
  });
  const [isPaymentGatewayOpen, setIsPaymentGatewayOpen] = useState(false);
  const [reference_no, setReference_no] = useState("")
  const [paymentGateway, setPaymentGateway] = useState("stripe"); // Default to Stripe
  const [donation, setDonation] = useState({
    personalInfo: {
      title: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    }
  });

  const stripePromise = loadStripe("pk_live_51MvUL8G527sG2b9VZF4Qdw9bCxz26EUT5ARosBKNAOazEcx7Y9yfOqW7FKS66GcEAbBfjPevkFwpUcgcCJ4pmLwC00w8Ql82mH");
  // const stripePromise = loadStripe("pk_test_51OpqyISCpAlqBVLzSBLMsm0w76Fvs0TkHkitCp7c5KFFk0DxPpVyU7do8eAJyi2SR4QAFnhNyphoteu9Yd16qswN00dQN0O2Jq");

  const session = useSessionId()

  const { data: countries = [] } = useQuery({
    queryKey: ["countries"],
    queryFn: fetchCountriesList,
    refetchInterval: 300000,
  });

  const { mutate: createCartTransaction } = useMutation({
    mutationFn: cartTransaction,
    onSuccess: (data) => {
      if (data.message == "Cart transaction has been created succesfully") {
        toast.dismiss()
        setIsPaymentGatewayOpen(true);
      } else {
        toast.error(data.message)
      }
    },
  });

  const { mutate: getReferenceId, isLoading, error } = useMutation({
    mutationFn: generateReferenceId,
    onSuccess: (referenceId) => {
      setReference_no(referenceId);
  
      const updatedDonation = { ...donation, referenceId, ...preferences, session };

      const cart = JSON.parse(localStorage.getItem("cart"))
      localStorage.setItem("userData",JSON.stringify({...donation,cart}));
      
      // Check if any required field is missing
      const isInvalid = requiredFields.some(field => !updatedDonation.personalInfo?.[field]);
  
      if (isInvalid) {
        toast.error("Missing required fields", updatedDonation);
        return null;
      }
      // toast.loading()
      toast.loading("processing")
      createCartTransaction(updatedDonation);
    },
  });
  


  const handleSubmit = () => {
    getReferenceId();
  };

  const getCurrentStep = () => {
    switch (step) {
      case 1:
        return <DonationCart setDonation={setDonation} />;
      case 2:
        return <GiftAid donation={donation} setDonation={setDonation} preferences={preferences} setPreferences={setPreferences} />;
      case 3:
        return <PersonalInfo donation={donation} setDonation={setDonation} countries={countries} paymentGateway={paymentGateway} setPaymentGateway={setPaymentGateway} />;
      default:
        return <DonationCart donation={donation} setDonation={setDonation} />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">

      <StepIndicator step={step} />
      {getCurrentStep()}


      {paymentGateway === "stripe" && isPaymentGatewayOpen && (
        <Elements stripe={stripePromise}>
          <StripePayment donation={donation} setIsPaymentGatewayOpen={setIsPaymentGatewayOpen} isPaymentGatewayOpen={isPaymentGatewayOpen} reference_no={reference_no} />
        </Elements>
      )}


      {paymentGateway === "paypal" && isPaymentGatewayOpen && (
        <PayPalPayment donation={donation} reference_no={reference_no} onSuccess={(details) => {
          toast.dismiss()
          setIsPaymentGatewayOpen(false);
        }} />
      )}


      <div className="mt-6 flex justify-between">
        <button
          onClick={() => setStep(step - 1)}
          disabled={step === 1}
          className={`px-6 py-2 rounded-lg ${step === 1
            ? "bg-gray-100 text-gray-400"
            : "bg-gray-100 text-gray-900 hover:bg-gray-200"
            }`}
        >
          Previous
        </button>
        <button
          onClick={step === 3 ? handleSubmit : () => setStep(step + 1)}
          className="px-6 py-2 rounded-lg bg-primary text-white hover:bg-primaryHover "
        >
          {step === 3 ? "Submit" : "Next"}
        </button>
      </div>
    </div>
  );
};

export default DonationWizard;
