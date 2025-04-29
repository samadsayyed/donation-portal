import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { ChevronLeft } from "lucide-react";
import React, { useState, useEffect } from "react";
import { createPaymentIntent, createSingleDonation } from "../../api/donationApi";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import useSessionId from "../../hooks/useSessionId";
import { useNavigate } from "react-router-dom";
import { encryptData } from "../../utils/functions";
import { useAuth } from "../../context/AuthContext";

// ISO 3166-1 alpha-2 country codes
const countryCodes = [
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "JP", name: "Japan" },
  { code: "CN", name: "China" },
  { code: "IN", name: "India" },
  { code: "BR", name: "Brazil" },
  { code: "RU", name: "Russia" },
  { code: "ZA", name: "South Africa" },
  { code: "MX", name: "Mexico" },
  { code: "SG", name: "Singapore" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "NZ", name: "New Zealand" },
  { code: "IE", name: "Ireland" },
  { code: "NL", name: "Netherlands" }
];

const PaymentForm = ({
  onRequestClose,
  onPaymentSuccess,
  setCurrentStep,
  setIsSuccess,
  setIsPaymentGatewayOpen,
  isPaymentGatewayOpen,
  reference_no,
}) => {
  const userData = JSON.parse(localStorage.getItem("userData"))

  const stripe = useStripe();
  const elements = useElements();
  const [email, setEmail] = useState(userData.personalInfo.email);
  const [name, setName] = useState(`${userData.personalInfo.firstName} ${userData.personalInfo.lastName}`);
  const [address, setAddress] = useState({
    line1: userData.personalInfo.address1,
    line2: userData.personalInfo.address2,
    city: userData.personalInfo.city,
    postalCode: userData.personalInfo.postcode,
    country: "GB" // Default country code for United Kingdom
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [coverTransactionFee, setCoverTransactionFee] = useState(true);
  const [showMobileSummary, setShowMobileSummary] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [stripeFee, setStripeFee] = useState(0);
  const showCoverFee = import.meta.env.VITE_ENABLE_COVER_FEE === "true";

  const navigate = useNavigate();
  const session = useSessionId();

  const { user, isAuthenticated } = useAuth();

  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  const amount = cartItems
    .reduce((total, item) => total + parseFloat(item.donation_amount) * item.quantity, 0)
    .toFixed(2);

  // UK Charity Stripe fee calculation (1.4% + 20p for UK/European cards)
  const calculateStripeFee = (donationAmount) => {
    // 1.4% + 20p for UK/European cards for registered charities
    const feePercentage = 0.014;
    const fixedFee = 0.20;
    const additionalFeee = 0.20;
    return (donationAmount * feePercentage) + fixedFee + additionalFeee;
  };

  // Update stripe fee and total amount when amount or coverTransactionFee changes
  useEffect(() => {
    const calculatedFee = calculateStripeFee(parseFloat(amount));
    setStripeFee(calculatedFee);
    setTotalAmount(coverTransactionFee ? parseFloat(amount) + calculatedFee : parseFloat(amount));
  }, [amount, coverTransactionFee]);

  const createDonation = useMutation({
    mutationFn: createSingleDonation,
    onMutate: () => {
      toast.loading("Processing your donation...");
    },
    onSuccess: () => {
      toast.dismiss();
      toast.success("Thank you for your donation!");
      setLoading(false);
      localStorage.removeItem("cart");

      // Use the success callbacks if provided
      if (setIsSuccess) setIsSuccess(true);
      if (onPaymentSuccess) onPaymentSuccess();

      const userData = localStorage.getItem("userData");
      if (userData) {
        const encryptedData = encryptData(userData);
        navigate(`/payment-success?data=${encodeURIComponent(encryptedData)}`);
      }
    },
    onError: (error) => {
      console.error("Error creating donation:", error);
      toast.dismiss();
      toast.error(error.message || "Failed to process donation");
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const handlePaymentIntent = useMutation({
    mutationFn: createPaymentIntent,
    onMutate: () => {
      toast.loading("Processing payment...");
    },
    onSuccess: async (data, variables) => {
      toast.dismiss();
      setLoading(false);

      const { paymentMethod } = variables;

      const { error: confirmError, paymentIntent } =
        await stripe.confirmCardPayment(data.clientSecret, {
          payment_method: paymentMethod.id,
          receipt_email: email,
        });

      if (confirmError) {
        console.error("Error confirming payment:", confirmError);
        setError(confirmError.message);
        setLoading(false);
        return;
      }

      // Get country name for display purposes
      const selectedCountry = countryCodes.find(c => c.code === address.country);
      const countryName = selectedCountry ? selectedCountry.name : address.country;

      // Format address for storage
      const formattedAddress = [
        address.line1,
        address.line2,
        address.city,
        address.postalCode,
        countryName
      ].filter(Boolean).join(", ");

      const donationData = {
        txn_id: paymentIntent.id,
        payment_amt: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        payment_status: "Completed",
        payment_mode_code: "STRIPE",
        auth_code: "",
        reference_no: reference_no,
        auth: isAuthenticated ? true : false,
        donor_name: variables.name,
        donor_address: formattedAddress,
        donor_email: email
      };

      if (isAuthenticated) {
        donationData.donor_id = user.user_id;
      } else {
        donationData.session_id = session;
      }

      createDonation.mutate(donationData);
    },
    onError: (error) => {
      console.error("Error creating payment intent:", error);
      toast.dismiss();
      toast.error(error.message || "Payment processing failed");
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setError("Payment system is not ready. Please try again.");
      return;
    }

    setLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
      billing_details: {
        name,
        email,
        address: {
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          postal_code: address.postalCode,
          country: address.country,
        },
      },
    });

    if (stripeError) {
      console.error("Error creating payment method:", stripeError);
      setError(stripeError.message);
      setLoading(false);
      return;
    }

    // Get country name for display purposes
    const selectedCountry = countryCodes.find(c => c.code === address.country);
    const countryName = selectedCountry ? selectedCountry.name : address.country;

    // Format address for API request
    const formattedAddress = [
      address.line1,
      address.line2,
      address.city,
      address.postalCode,
      countryName
    ].filter(Boolean).join(", ");

    handlePaymentIntent.mutate({
      amount: Math.round(totalAmount * 100), // Ensures an integer
      reference_no,
      name,
      billing_address: formattedAddress,
      paymentMethod,
    });
  };

  const handleClose = () => {
    if (setIsPaymentGatewayOpen) {
      setIsPaymentGatewayOpen(false);
    }
    if (onRequestClose) {
      onRequestClose();
    }
  };

  // Toggle mobile summary view
  const toggleMobileSummary = () => {
    setShowMobileSummary(!showMobileSummary);
  };

  // Summary component to avoid duplication
  const DonationSummary = () => (
    <div className="flex flex-col text-white">
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Donation Summary</h2>

      <div className="flex flex-col space-y-3 md:space-y-4 mb-6 md:mb-8">
        {cartItems.map((item, index) => (
          <div key={index} className="bg-gray-800 rounded-lg p-3 md:p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-sm md:text-base">{item.program_name}</h3>
                <p className="text-gray-400 text-xs md:text-sm">Quantity: {item.quantity}</p>
              </div>
              <p className="font-semibold text-sm md:text-base">£{(item.quantity * item.donation_amount).toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto">
        <div className="border-t border-gray-700 pt-3 md:pt-4">
          <div className="flex justify-between text-base md:text-lg">
            <span>Donation Amount</span>
            <span>£{parseFloat(amount).toFixed(2)}</span>
          </div>

          {coverTransactionFee && (
            <div className="flex justify-between text-base md:text-lg mt-1 md:mt-2">
              <span>Transaction Fee</span>
              <span>£{stripeFee.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-base md:text-lg mt-3 md:mt-4 font-bold">
            <span>Total</span>
            <span>£{totalAmount.toFixed(2)}</span>
          </div>
          <p className="text-gray-400 text-xs md:text-sm mt-2">Thank you for your generosity</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`fixed inset-0 z-50 ${isPaymentGatewayOpen ? "flex" : "hidden"} bg-black/95`}>
      {/* Mobile Summary Drawer - only visible on small screens when toggled */}
      <div
        className={`fixed inset-0 bg-black/90 z-20 transition-transform duration-300 ${showMobileSummary ? "translate-y-0" : "translate-y-full"
          } md:hidden overflow-y-auto`}
      >
        <div className="h-full p-4 pt-12 pb-24">
          <button
            className="absolute top-4 right-4 p-2 bg-gray-800 rounded-full text-white"
            onClick={toggleMobileSummary}
            aria-label="Close summary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <DonationSummary />
        </div>
      </div>

      <div className="w-full h-full md:grid md:grid-cols-2 overflow-y-auto">
        {/* Left Section - Order Summary (hidden on mobile) */}
        <div className="hidden md:flex h-full p-6 md:p-8 lg:p-12 flex-col overflow-y-auto">
          <div className="flex items-center gap-4 mb-6 md:mb-8">
            <button
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
              onClick={handleClose}
              aria-label="Go back"
            >
              <ChevronLeft className="text-white" size={20} />
            </button>
          </div>

          <DonationSummary />
        </div>

        {/* Right Section - Payment Form */}
        <div className="bg-white h-full w-full overflow-y-auto">
          {/* Mobile header with back button and summary toggle */}
          <div className="flex items-center justify-between p-4 md:hidden bg-gray-800 text-white">
            <button
              className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
              onClick={handleClose}
              aria-label="Go back"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-lg font-bold">Donate</h1>
            <button
              className="px-3 py-1 text-sm rounded-full bg-blue-600 hover:bg-blue-700 transition-colors"
              onClick={toggleMobileSummary}
              aria-label="View summary"
            >
              Summary
            </button>
          </div>

          {/* Mobile Total Summary Bar - Sticky at bottom */}
          <div className="md:hidden sticky bottom-0 left-0 right-0 bg-gray-800 text-white p-3 flex justify-between items-center z-10">
            <span className="text-sm">Total: <span className="font-bold">£{totalAmount.toFixed(2)}</span></span>
            <button
              type="button"
              onClick={() => {
                const formElement = document.getElementById('donation-form');
                if (formElement) formElement.dispatchEvent(new Event('submit', { bubbles: true }));
              }}
              disabled={loading || !stripe}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed text-sm font-medium"
            >
              {loading ? "Processing..." : "Complete Donation"}
            </button>
          </div>

          <div className="max-w-xl mx-auto p-4 pb-24 md:p-8 md:pb-8">
            <h1 className="text-xl md:text-2xl font-bold mb-6 hidden md:block">Complete Your Donation</h1>

            <form id="donation-form" onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {/* Personal Information */}
              <div className="bg-gray-50 px-4 md:px-6 py-3 md:py-4 rounded-lg">
                <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label htmlFor="name" className="block text-xs md:text-sm font-medium mb-1">Full Name</label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-2 text-sm md:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-xs md:text-sm font-medium mb-1">Email</label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-2 text-sm md:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Billing Address */}
              <div className="bg-gray-50 px-4 md:px-6 py-3 md:py-4 rounded-lg">
                <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Billing Address</h2>
                <div className="space-y-3 md:space-y-4">
                  <div>
                    <label htmlFor="line1" className="block text-xs md:text-sm font-medium mb-1">Address Line 1</label>
                    <input
                      id="line1"
                      type="text"
                      value={address.line1}
                      onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                      className="w-full p-2 text-sm md:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="line2" className="block text-xs md:text-sm font-medium mb-1">Address Line 2 (Optional)</label>
                    <input
                      id="line2"
                      type="text"
                      value={address.line2}
                      onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                      className="w-full p-2 text-sm md:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label htmlFor="city" className="block text-xs md:text-sm font-medium mb-1">City</label>
                      <input
                        id="city"
                        type="text"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        className="w-full p-2 text-sm md:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="postalCode" className="block text-xs md:text-sm font-medium mb-1">Postal Code</label>
                      <input
                        id="postalCode"
                        type="text"
                        value={address.postalCode}
                        onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                        className="w-full p-2 text-sm md:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="country" className="block text-xs md:text-sm font-medium mb-1">Country</label>
                    <select
                      id="country"
                      value={address.country}
                      onChange={(e) => setAddress({ ...address, country: e.target.value })}
                      className="w-full p-2 text-sm md:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                      required
                    >
                      <option value="">Select a country</option>
                      {countryCodes.map(country => (
                        <option key={country.code} value={country.code}>
                          {country.name} ({country.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Transaction Fee Option - Only show if enabled in env */}
              {showCoverFee && (
                <div className="bg-gray-50 px-4 md:px-6 py-3 md:py-4 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="coverFee"
                        type="checkbox"
                        checked={coverTransactionFee}
                        onChange={(e) => setCoverTransactionFee(e.target.checked)}
                        className="w-4 h-4 border border-gray-300 rounded focus:ring-3 focus:ring-blue-300"
                      />
                    </div>
                    <div className="ml-3 text-xs md:text-sm">
                      <label htmlFor="coverFee" className="font-medium text-gray-700">Cover transaction fee</label>
                      <p className="text-gray-500">Add £{stripeFee.toFixed(2)} to cover Stripe's processing fee</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Information */}
              <div className="bg-gray-50 px-4 md:px-6 py-3 md:py-4 rounded-lg">
                <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Payment Information</h2>
                <div>
                  <label htmlFor="card-element" className="block text-xs md:text-sm font-medium mb-1">Credit or debit card</label>
                  <div className="border border-gray-300 rounded-md p-3 md:p-4 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                    <CardElement
                      id="card-element"
                      options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#424770',
                            '::placeholder': {
                              color: '#aab7c4',
                            },
                          },
                          invalid: {
                            color: '#9e2146',
                          },
                        },
                      }}
                    />
                  </div>

                  {error && (
                    <div className="mt-2 text-red-600 text-xs md:text-sm bg-red-50 p-2 rounded border border-red-200">
                      {error}
                    </div>
                  )}
                </div>
              </div>

              {/* Desktop Submit Button - hidden on mobile */}
              <button
                type="submit"
                disabled={loading || !stripe}
                className="hidden md:block w-full bg-blue-600 text-white py-3 md:py-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-base md:text-lg"
              >
                {loading ? "Processing..." : `Donate £${totalAmount.toFixed(2)}`}
              </button>

              <p className="text-xs md:text-sm text-gray-500 text-center mt-2 md:mt-4">
                Your donation is securely processed by Stripe. Your card details are encrypted and never stored on our servers.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;