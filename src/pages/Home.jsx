import { useMutation } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import { createCart } from "../api/cartApi";
import ReactGA from "react-ga4";
import AmountSelection from "../components/DonationComponents/AmountSelection/AmountSelection";
import CategorySelection from "../components/DonationComponents/CategorySelection/CategorySelection";
import CountrySelection from "../components/DonationComponents/CountrySelection/CountrySelection";
import ProgramSelection from "../components/DonationComponents/ProgramSelection/ProgramSelection";
import { useCart } from "../context/CartContext";
import useLocalStorage from "../hooks/useLocalStorage";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import DonationPeriodSelection from "../components/DonationPeriodSelection";
import { useAuth } from "../context/AuthContext";

const DonationPortal = ({ sessionId, setIsCartOpen, setRender, render }) => {
  const [step, setStep] = useLocalStorage("donationStep", 1);
  const [selectedPeriod, setSelectedPeriod] = useLocalStorage("selectedPeriod", null);
  const [selectedCategory, setSelectedCategory] = useLocalStorage("selectedCategory", "");
  const [selectedProgram, setSelectedProgram] = useLocalStorage("selectedProgram", "");
  const [selectedCountry, setSelectedCountry] = useLocalStorage("selectedCountry", "");
  const [amount, setAmount] = useLocalStorage("donationAmount", "");
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();


  const { addToCart } = useCart();

  const createCartMutation = useMutation({
    mutationFn: createCart,
    onMutate: () => {
      toast.loading("Creating cart...");
    },
    onSuccess: (data) => {
      toast.dismiss();
      toast.success("Cart created successfully!");
      // Track add_to_cart event with GA4
      ReactGA.event({
        category: "Donation",
        action: "add_to_cart",
        label: "Cart Creation",
        value: Number(amount),
        donation_period: selectedPeriod,
        category_id: selectedCategory,
        program_id: selectedProgram,
        country_id: selectedCountry,
        currency: "GBP"
      });
      console.log("Cart created successfully!")
      addToCart();
      resetDonation();
      setRender(p => !p);
      setIsCartOpen(true)
    },
    onError: (error) => {
      toast.dismiss();
      toast.error(`Error creating cart: ${error.message}`);
    },
    onSettled: () => {
    },
  });

  useEffect(() => {
    const category = Number(searchParams.get("category_id"));
    const program = Number(searchParams.get("program_id"));
    let country = searchParams.get("country_id");
    const amount = searchParams.get("amount");
    const type = searchParams.get("type");

    // if (!country) country = "19"; // Set country to 19 if not defined

    if (category) setSelectedCategory(category);
    if (program) setSelectedProgram(program);
    if (country) setSelectedCountry(country);
    if (amount) setAmount(amount);

    // If all parameters exist, skip to the amount selection step
    if (category && program && type === "one-off") {
      setStep(5);
    }
    // If only category is defined, go to step 2
    else if (category && !program && !amount && !type) {
      setStep(2);
    }
  }, [searchParams]);

  const resetDonation = () => {
    setStep(1);
    setSelectedCategory("");
    setSelectedProgram("");
    setAmount("");
    localStorage.removeItem("donationStep");
    localStorage.removeItem("selectedPeriod");
    localStorage.removeItem("selectedCategory");
    localStorage.removeItem("selectedProgram");
    localStorage.removeItem("selectedCountry");
    localStorage.removeItem("donationAmount");
  };

  const handlePeriodSelect = (period) => {
    setSelectedPeriod(period);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setStep(3);
  };

  const handleCountrySelect = async (country) => {
    setSelectedCountry(country);
    setStep(5);
  };

  const handleAmountSelect = async (amount) => {
    try {
      // Make sure donationPeriod is never null
      let donationPeriod = localStorage.getItem("selectedPeriod");

      // Fallback if it's null
      if (!donationPeriod) {
        donationPeriod = "one-off";
      }

      // If donationPeriod is wrapped in quotes (e.g. "\"one-off\""), clean it
      if (donationPeriod.includes('"')) {
        donationPeriod = donationPeriod.replaceAll('"', '');
      }

      const payload = {
        donation_period: donationPeriod,
        currency: "GBP",
        currency_id: 1,
        category_id: Number(selectedCategory),
        program_id: selectedProgram,
        country_id: selectedCountry || 19,
        quantity: 1,
        donation_amount: amount,
        donation_pound_amount: amount,
        participant_name: "",
      };

      if (isAuthenticated) {
        payload.donor_id = user.user_id;
      } else {
        payload.session_id = sessionId;
      }

      createCartMutation.mutate(payload);

    } catch (error) {
      console.error("DEBUG ERROR:", error);
      toast.error(`Error fetching rate: ${error.message}`);
    }
  };



  const handleBack = () => {



    if (step === 5) {
      console.log("amount page");
      setStep(step - 1);
      if (selectedCountry === "") {
        console.log("selected country is empty");

        setStep(step - 2);
      } else {
        console.log("selected country is not empty");
        setStep(step - 1);
      }
    } else if(step === 3){
      setStep(step - 2);
      // setSelectedCountry("");
    } else{
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 ">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl bg-white/90 backdrop-blur-sm shadow-xl p-8">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-grey mb-2">
              Make a Difference
            </h1>
            <p className="text-gray-600">Your contribution can change lives</p>
          </header>

          <div className="mb-8">
  <div className="flex items-center justify-between mb-2">
    <span className="text-sm font-medium text-gray-700">
      Step {step >= 3 ? step - 1 : step} of 4
    </span>
    <span className="text-sm font-medium text-gray-700">
      {step === 1 && "Donation Period"}
      {step === 2 && "Program"}
      {step === 3 && "Country"}
      {step === 4 && "Amount"}
    </span>
  </div>
  <div className="h-2 bg-gray-200 rounded-full">
    <motion.div
      className="h-full bg-primary rounded-full"
      initial={{ width: 0 }}
      animate={{ width: `${((step >= 3 ? step - 1 : step) / 4) * 100}%` }}
      transition={{ duration: 0.3 }}
    />
  </div>
</div>


          {step > 1 && (
            <button
              onClick={handleBack}
              className="mb-6 flex items-center text-gray-600 hover:text-grey"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back
            </button>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <DonationPeriodSelection
                selectedPeriod={selectedPeriod}
                onSelect={handlePeriodSelect}
                setStep={setStep}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
            )}
            {step === 2 && (
              <CategorySelection
                selectedCategory={selectedCategory}
                setStep={setStep}
                onSelect={handleCategorySelect}
              />
            )}
            {step === 3 && (
              <ProgramSelection
                category={selectedCategory}
                program={selectedProgram}
                setStep={setStep}
                setSelectedCountry={setSelectedCountry}
                onBack={handleBack}
                setSelectedProgram={setSelectedProgram}
              />
            )}
            {step === 4 && (
              <CountrySelection
                category={selectedCategory}
                program={selectedProgram}
                onSelect={handleCountrySelect}
                onBack={handleBack}
                setStep={setStep}
              />
            )}
            {step === 5 && (
              <AmountSelection
                prevData={{ selectedCategory, selectedCountry, selectedProgram }}
                selectedProgram={selectedProgram}
                onSelect={handleCountrySelect}
                setStep={setStep}
                onBack={handleBack}
                handleAmountSelect={handleAmountSelect}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default DonationPortal;
