import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import DonationCart from "../components/CheckoutPage/DonationCart";
import PersonalInfo from "../components/CheckoutPage/PersonalInfo";
import StepIndicator from "../components/CheckoutPage/StepIndicator";
import { fetchCountriesList } from "../api/countiesApi";
import { generateReferenceId } from "../utils/functions";
import { cartTransaction, updateParticipant } from "../api/cartApi";
import useSessionId from "../hooks/useSessionId";
import StripePayment from "../components/CheckoutPage/StripePayment";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import toast from "react-hot-toast";
import PayPalPayment from "../components/CheckoutPage/PayPalPayment";
import { requiredFields } from "../utils/data";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, ShoppingBag, CreditCard, User } from "lucide-react";


import { Mail, Phone, MessageSquare, Mailbox, Info, AlertCircle, Check } from "lucide-react";

export const GiftAid = ({ donation, setDonation, preferences, setPreferences }) => {
  const [showFeeInfo, setShowFeeInfo] = useState(false);
  const showCoverFee = import.meta.env.VITE_ENABLE_COVER_FEE === "true";

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
              className={`flex flex-col items-center p-3 rounded-lg border ${preferences[key]
                ? "border-primary bg-primary bg-opacity-5"
                : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                } cursor-pointer transition-all duration-200`}
            >
              <Icon size={18} className={preferences[key] ? "text-primary" : "text-gray-500"} />
              <span className="mt-1 text-sm">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Legal Text */}
      <div className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg">
        <p>
          <span className="font-medium">Gift Aid:</span> By checking Gift Aid, I confirm I am a UK taxpayer and understand I must pay Income/Capital Gains Tax equal to the Gift Aid claimed.
        </p>
        <p className="mt-1">
          <span className="font-medium">Communication:</span> We protect your data and only contact you according to your preferences. See our Privacy Policy for details.
        </p>
        <p className="mt-1">
          For any questions or to update your preferences, contact <span className="text-secondary">info@globalcarefoundation.org</span>
        </p>
      </div>
    </div>
  );
};



const DonationWizard = () => {
  const [step, setStep] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);

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
  const [participantNames, setParticipantNames] = useState({});

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [cart, setCart] = useState([]);

  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISH_KEY);

  const session = useSessionId()
  const { user, isAuthenticated } = useAuth();

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
      const updatedDonation = { ...donation, referenceId, ...preferences, session, user, isAuthenticated };

      const cart = JSON.parse(localStorage.getItem("cart"));
      localStorage.setItem("userData", JSON.stringify({ ...donation, cart }));

      // Find missing required fields
      // Get and sanitize phone number
      const rawPhone = updatedDonation.personalInfo?.phone?.trim() || "";
      const cleanedPhone = rawPhone.replace(/[^\d]/g, ""); // remove all non-digit characters

      if (!rawPhone) {
        toast.error("Phone number is required.");
        return;
      }

      if (cleanedPhone.length < 10 || cleanedPhone.length > 15) {
        toast.error("Phone number must be between 10 to 15 digits.");
        return;
      }

      // Check for other missing required fields
      const missingFields = requiredFields.filter(
        (field) => !updatedDonation.personalInfo?.[field]
      );

      if (missingFields.length > 0) {
        toast.error(`Missing required fields: ${missingFields.join(", ")}`);
        return;
      }

      setIsSubmitted(true);
      toast.loading("Processing...");
      createCartTransaction(updatedDonation);
    },
  });

  const { mutate: updateParticipantMutation } = useMutation({
    mutationFn: updateParticipant,
    onSuccess: () => {
      toast.dismiss();
      toast.success("Participant names updated successfully!");
    },
    onError: (error) => {
      toast.dismiss();
      toast.error(`Error updating participant names: ${error.message}`);
    },
  });

  const handleNext = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty. Please add items before proceeding.");
      return;
    }

    if (step == 1) {
      // Check if any participant name is empty for items requiring participants
      const emptyNames = cart.some(item => {
        if (item.participant_required === "Y") {
          const names = participantNames[item.cart_id] || [];
          return names.length === 0 || names.some(name => !name.trim());
        }
        return false;
      });

      if (emptyNames) {
        toast.error("Please fill in all participant names for required items before proceeding.");
        return;
      }

      // Only process items that require participants
      cart.forEach(item => {
        if (item.participant_required === "Y" && participantNames[item.cart_id]) {
          const data = {
            cart_id: item.cart_id,
            participant_name: participantNames[item.cart_id].join()
          };
          updateParticipantMutation(data);
        }
      });

      // Animate transition
      setIsAnimating(true);
      setTimeout(() => {
        setStep(step + 1);
        window.scrollTo(0, 0);
        setIsAnimating(false);
      }, 300);
    }
    else {
      setTimeout(() => {
        setStep(step + 1);
        window.scrollTo(0, 0);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handlePrevious = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setStep(step - 1);
      window.scrollTo(0, 0);
      setIsAnimating(false);
    }, 300);
  };

  const handleSubmit = () => {
    getReferenceId();
  };

  const getCurrentStep = () => {
    switch (step) {
      case 1:
        return <DonationCart
          setCart={setCart}
          participantNames={participantNames}
          setParticipantNames={setParticipantNames}
        />;
      case 2:
        return <GiftAid donation={donation} setDonation={setDonation} preferences={preferences} setPreferences={setPreferences} />;
      case 3:
        return <PersonalInfo donation={donation} setDonation={setDonation} countries={countries} paymentGateway={paymentGateway} setPaymentGateway={setPaymentGateway} submitted={isSubmitted} />;
      default:
        return <DonationCart donation={donation} setDonation={setDonation} />;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Review Your Donation";
      case 2:
        return "Gift Aid Declaration";
      case 3:
        return "Your Information";
      default:
        return "Checkout";
    }
  };

  const getStepIcon = () => {
    switch (step) {
      case 1:
        return <ShoppingBag className="w-5 h-5" />;
      case 2:
        return <CreditCard className="w-5 h-5" />;
      case 3:
        return <User className="w-5 h-5" />;
      default:
        return <ShoppingBag className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-2">
          {getStepIcon()}
          {getStepTitle()}
        </h1>
        <p className="text-gray-500">Step {step} of 3</p>
      </div>

      <StepIndicator step={step} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="mt-6"
        >
          {getCurrentStep()}
        </motion.div>
      </AnimatePresence>

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

      <div className="mt-8 flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={step === 1 || isAnimating}
          className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-all ${step === 1 || isAnimating
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </button>

        {cart.length === 0 && (
          <Link to={"/"}>
            <button
              className={`px-6 py-3 rounded-lg bg-primary text-white hover:bg-primaryHover flex items-center gap-2 transition-all`}
            >
              <ShoppingBag className="w-4 h-4" />
              Add Programs
            </button>
          </Link>
        )}


        <button
          onClick={step === 3 ? handleSubmit : handleNext}
          disabled={cart.length === 0 || isSubmitted || isAnimating}
          className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-all ${cart.length === 0 || isSubmitted || isAnimating
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-primary text-white hover:bg-primaryHover"
            }`}
        >
          {step === 3 ? "Submit" : "Next"}
          {step !== 3 && <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

export default DonationWizard;
