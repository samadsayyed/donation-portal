import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { ChevronLeft } from "lucide-react";
import React, { useState } from "react";
import { createPaymentIntent, createSingleDonation } from "../../api/donationApi";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import useSessionId from "../../hooks/useSessionId";
import { useNavigate } from "react-router-dom";
import { encryptData } from "../../utils/functions";

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

  console.log(userData,"------------------");
  

  const stripe = useStripe();
  const elements = useElements();
  const [email, setEmail] = useState(userData.personalInfo.email);
  const [name, setName] = useState(`${userData.personalInfo.firstName} ${userData.personalInfo.lastName}`);
  const [address, setAddress] = useState({
    line1: userData.personalInfo.address1,
    line2: userData.personalInfo.address2,
    city: userData.personalInfo.city,
    // state: userData.personalInfo.state,
    postalCode: userData.personalInfo.postcode,
    country: "GB" // Default country code for United Kingdom
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const session = useSessionId();

  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  const amount = cartItems
    .reduce((total, item) => total + parseFloat(item.donation_amount) * item.quantity, 0)
    .toFixed(2);

  const checkTransitionFee = JSON.parse(localStorage.getItem("donationPreferences"))?.coverFee || false;

  const totalAmount = Number(checkTransitionFee
    ? (parseFloat(amount) * 1.0125).toFixed(2) // Adding 1.25% transaction fee
    : amount);


    console.log(totalAmount,"----------------");
    

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
        navigate(`/success/${encodeURIComponent(encryptedData)}`);
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
        // address.state,
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
        auth: 0,
        session_id: session,
        donor_name: variables.name,
        donor_address: formattedAddress,
        donor_email: email
      };

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
          state: address.state,
          postal_code: address.postalCode,
          country: address.country, // Using ISO country code
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
      address.state,
      address.postalCode,
      countryName
    ].filter(Boolean).join(", ");

    handlePaymentIntent.mutate({
      amount: totalAmount * 100,
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

  return (
    <div className={`fixed inset-0 z-50 ${isPaymentGatewayOpen ? "flex" : "hidden"} bg-black/95 overflow-hidden`}>
      <div className="grid md:grid-cols-2 w-full h-full">
        {/* Left Section - Order Summary */}
        <div className="h-full p-6 md:p-12 flex flex-col">
          <div className="flex items-center gap-4 mb-8">
            <button
              className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
              onClick={handleClose}
              aria-label="Go back"
            >
              <ChevronLeft className="text-white" size={20} />
            </button>
            {/* <span className="px-3 py-1 text-sm bg-orange-500 rounded-md text-white font-medium">TEST MODE</span> */}
          </div>

          <div className="flex-grow flex flex-col text-white">
            <h2 className="text-2xl font-bold mb-6">Donation Summary</h2>

            <div className="flex flex-col space-y-4 mb-8">
              {cartItems.map((item, index) => (
                <div key={index} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{item.program_name}</h3>
                      <p className="text-gray-400 text-sm">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">£{(item.quantity * item.donation_amount).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto">
              <div className="border-t border-gray-700 pt-4 mb-4">
                <div className="flex justify-between text-lg">
                  <span>Total</span>
                  <span className="font-bold">£{totalAmount.toFixed(2)}</span>
                </div>
                <p className="text-gray-400 text-sm mt-2">Thank you for your generosity</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Payment Form */}
        <div className="bg-white h-full overflow-y-auto">
          <div className="max-w-xl mx-auto p-2 md:p-8">
            <h1 className="text-2xl font-bold mb-8">Complete Your Donation</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="bg-gray-50 px-6 rounded-lg">
                <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">Full Name</label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Billing Address */}
              <div className="bg-gray-50 px-6 rounded-lg">
                <h2 className="text-lg font-semibold mb-4">Billing Address</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="line1" className="block text-sm font-medium mb-1">Address Line 1</label>
                    <input
                      id="line1"
                      type="text"
                      value={address.line1}
                      onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                      className="w-full p-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="line2" className="block text-sm font-medium mb-1">Address Line 2 (Optional)</label>
                    <input
                      id="line2"
                      type="text"
                      value={address.line2}
                      onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                      className="w-full p-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium mb-1">City</label>
                      <input
                        id="city"
                        type="text"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        className="w-full p-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                        required
                      />
                    </div>

                    {/* <div>
                      <label htmlFor="state" className="block text-sm font-medium mb-1">State/Province</label>
                      <input
                        id="state"
                        type="text"
                        value={address.state}
                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                        className="w-full p-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                        required
                      />
                    </div> */}
                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium mb-1">Postal Code</label>
                      <input
                        id="postalCode"
                        type="text"
                        value={address.postalCode}
                        onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                        className="w-full p-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">

                    <div>
                      <label htmlFor="country" className="block text-sm font-medium mb-1">Country</label>
                      <select
                        id="country"
                        value={address.country}
                        onChange={(e) => setAddress({ ...address, country: e.target.value })}
                        className="w-full p-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
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
              </div>

              {/* Payment Information */}
              <div className="bg-gray-50 px-6 rounded-lg">
                <h2 className="text-lg font-semibold mb-4">Payment Information</h2>
                <div>
                  <label htmlFor="card-element" className="block text-sm font-medium mb-1">Credit or debit card</label>
                  <div className="border border-gray-300 rounded-md p-4 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
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
                    <div className="mt-2 text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200">
                      {error}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !stripe}
                className="w-full bg-blue-600 text-white py-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-lg"
              >
                {loading ? "Processing..." : `Donate £${totalAmount.toFixed(2)}`}
              </button>

              <p className="text-sm text-gray-500 text-center mt-4">
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