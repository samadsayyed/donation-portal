import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import PAFModal from "./PAF";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import PaymentForm from "./PaymentGateway";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import Contact from "./Contact";
import Giftaid from "./Giftaid";

const PersonalDetailsForm = ({ currentStep, setCurrentStep, setIsSuccess }) => {
  const stripePromise = loadStripe(
    "pk_test_51QZ5TIP6D9LHv1Cj1DhRgOUqhSNlcoh8JOOYU77zkfmtX2g6LFKzNYkAu7j8H9qYCeHnIBgnpqfTWbb5p2WXdTsB00Yl6A05vL"
  );
  const [formData, setFormData] = useState({
    title: "Mr",
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    address1: "",
    address2: "",
    postcode: "",
    city: "",
    city_id: "",
    country: "",
  });
  const [addCity, setAddCity] = useState(false);
  const [NewCity, setNewCity] = useState("");
  const [isPaymentGatewayOpen, setIsPaymentGatewayOpen] = useState(false);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const apiToken = import.meta.env.VITE_API_TOKEN;
  const [reference_no, setReference_no] = useState(null);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handlePaymentSelection = (event) => {
    const selectedPayment = event.target.id;
    setFormData((prev) => ({
      ...prev,
      paywith: selectedPayment,
    }));
  };

  // const generateSessionId = () => {
  //   const existingSessionData = localStorage.getItem("sessionIdData");
  //   if (existingSessionData) {
  //     const { sessionId, expiry } = JSON.parse(existingSessionData);
  //     if (new Date().getTime() < expiry) {
  //       return sessionId;
  //     }
  //   }

  //   const timestamp = new Date().getTime();
  //   const randomPart = Math.random().toString(36).substring(2, 15);
  //   const newSessionId = `session-${timestamp}-${randomPart}`;
  //   const expiryTime = timestamp + 24 * 60 * 60 * 1000;

  //   localStorage.setItem(
  //     "sessionIdDatatr",
  //     JSON.stringify({ sessionId: newSessionId, expiry: expiryTime })
  //   );

  //   return newSessionId;
  // };

  // React Query Mutation to update reference ID
  const updateReferenceId = async () => {
    const referenceId = Array(32)
      .fill(0)
      .map(() => "12345abcde"[Math.floor(Math.random() * 10)])
      .join("");

    try {
      const response = await axios.get(
        `${apiUrl}payment/reference/${referenceId}`,
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      setReference_no(response.data.reference_id);
      return response.data.reference_id;
    } catch (err) {
      throw err;
    }
  };

  // React Query Mutation to update transaction
  const updateTransaction = async (refId, updatedFormData) => {
    // Generate session ID
    const sessionId = generateSessionId();

    // Initialize default values
    let giftaidValue = "N";
    let contactPrefs = {
      email: "N",
      phone: "N",
      post: "N",
      sms: "N",
    };

    // Get giftaid information from localStorage
    try {
      const giftaidData = localStorage.getItem("giftaidclaim");
      if (giftaidData) {
        const { value } = JSON.parse(giftaidData);
        giftaidValue = value ? value : "N";
      }
    } catch (error) {
    }

    // Get contact preferences from localStorage
    try {
      const contactPreferencesData = localStorage.getItem("contactPreferences");
      if (contactPreferencesData) {
        const parsed = JSON.parse(contactPreferencesData);
        contactPrefs = {
          email: parsed.email || "N",
          phone: parsed.phone || "N",
          post: parsed.post || "N",
          sms: parsed.sms || "N",
        };
      }
    } catch (error) {
    }

    // Create and populate FormData
    const form_Data = new FormData();
    form_Data.append("auth", 0);
    form_Data.append("session_id", sessionId);
    form_Data.append("reference_no", refId);
    form_Data.append("guest_details", JSON.stringify(updatedFormData));
    form_Data.append("payment_method", formData.paywith);
    // form_Data.append("is_giftaid", giftaidValue);
    form_Data.append("tele_calling", contactPrefs.phone);
    form_Data.append("send_email", contactPrefs.email);
    form_Data.append("send_mail", contactPrefs.post);
    form_Data.append("send_text", contactPrefs.sms);
    try {
      const response = await axios.post(
        `${apiUrl}payment/transaction`,
        form_Data,
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setIsSuccess(response.data.success);
      return response.data;
    } catch (error) {
      setIsSuccess(false);
      throw error;
    }
  };

  const buyFunction = async () => {
    try {
      const response = await axios.post("http://localhost:3000/payment", {});

      if (response.status === 200) {
        window.location.href = response.data.url;
      }
    } catch (error) {
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedFormData = {
      ...formData,
      address1: document.getElementById("address-1").value,
      address2: document.getElementById("address-2").value,
      postcode: document.getElementById("postCode").value,
      city: document.getElementById("city")?.value || NewCity,
      city_id: "1",
      city_name: document.getElementById("city")?.value || NewCity,
      country: String(document.getElementById("countries").value),
    };

    setFormData(updatedFormData);

    try {
      const refId = await updateReferenceId();


      await updateTransaction(refId, updatedFormData);
      // await buyFunction();
      // openPaymentModal();
      setIsPaymentGatewayOpen(true);
      // setCurrentStep(5)
    } catch (err) {
    }
  };

  return (
    <>
      <Elements stripe={stripePromise}>
        <PaymentForm
          setCurrentStep={setCurrentStep}
          isPaymentGatewayOpen={isPaymentGatewayOpen}
          setIsPaymentGatewayOpen={setIsPaymentGatewayOpen}
          reference_no={reference_no}
        />
        <form
          onSubmit={handleSubmit}
          className="flex justify-center items-center"
        >
          <div className="rounded-lg md:p-8 px-2 w-full max-w-3xl mx-auto ">
            <h2 className="text-2xl font-bold mb-6 text-center text-[#02343F]">
              Enter Your Personal Details
            </h2>
            <div className="md:bg-gray-100 md:shadow-md md:p-4 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="w-full">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-600 mb-1"
                >
                  Title
                </label>
                <select
                  id="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-gray-800 appearance-none hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                >
                  <option value="Mr">Mr</option>
                  <option value="Mrs">Mrs</option>
                  <option value="Ms">Ms</option>
                </select>
              </div>

              <div className="w-full">
                <label
                  htmlFor="first_name"
                  className="block text-sm font-medium text-gray-600 mb-1"
                >
                  First Name
                  <span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  id="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-gray-800 placeholder-gray-400 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  required
                />
              </div>

              <div className="w-full">
                <label
                  htmlFor="last_name"
                  className="block text-sm font-medium text-gray-600 mb-1"
                >
                  Last Name
                  <span className="text-red-500 ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  id="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-gray-800 placeholder-gray-400 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Phone Input */}
              <div className="w-full">
                <label
                  htmlFor="phone"
                  className="block text-gray-800 text-sm font-medium mb-1"
                >
                  <span className="text-red-500">*</span> Phone
                </label>
                <input
                  type="number"
                  id="phone"
                  pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-gray-800 placeholder-gray-400 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  required
                />
              </div>

              {/* Email Input */}
              <div className="w-full">
                <label
                  htmlFor="email"
                  className="block text-gray-800 text-sm font-medium mb-1"
                >
                  <span className="text-red-500">*</span> Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-3 text-gray-800 placeholder-gray-400 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  required
                />
              </div>
            </div>
            </div>
            <hr className="border-t border-black md:mx-[-40px] my-4" />
            <PAFModal
              NewCity={NewCity}
              setNewCity={setNewCity}
              addCity={addCity}
              setAddCity={setAddCity}
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
            />
            <hr className="border-t border-black md:mx-[-40px] my-4" />
            <h2 className="text-2xl font-bold mb-6 text-center text-[#02343F]">
              Select Payment Method
            </h2>
            <div className="container mx-auto  md:bg-gray-100 md:shadow-md md:p-4 md:rounded-xl">
              <div className="grid grid-cols-3 gap-6">
                {["stripe", "worldpay", "paypal"].map((paymentMethod) => (
                  <div
                    key={paymentMethod}
                    className={`flex items-center flex-col bg-gray-50 border w-full border-gray-200 rounded-lg py-2.5 px-3 text-gray-800 placeholder-gray-400 hover:border-gray-300focus:border-transparent transition-colors duration-200 `}
                  >
                    <input
                      type="radio"
                      id={paymentMethod}
                      name="paymentMethod"
                      className="relative md:right-[-80px] top-2 w-4 h-4 accent-[#02343F] align-middle border-2 border-black rounded-sm "
                      onChange={handlePaymentSelection}
                      required
                    />
                    <label
                      htmlFor={paymentMethod}
                      className="flex flex-col items-center space-y-2 cursor-pointer"
                    >
                      <img
                        src={`/${paymentMethod}.svg`}
                        alt={`${paymentMethod} logo`}
                        className="w-[100px] h-[100px]"
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <hr className="border-t border-black md:mx-[-40px] my-4" />

            <div className="w-full max-w-4xl mx-auto ">
          <Giftaid />
          <Contact />
        </div>
            <div className="text-center mt-6">
              <button
                type="submit"
                className="px-4 py-2 rounded bg-[#02343F] text-white hover:bg-[#02343fc5] "
              >
                Proceed To Payment
              </button>
            </div>
          </div>
        </form>
       
      </Elements>
    </>
  );
};

export default PersonalDetailsForm;
