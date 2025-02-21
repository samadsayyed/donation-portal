import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import toast from "react-hot-toast";
import { createCart } from "../api/cartApi";
import { fetchProgramRate } from "../api/programsApi";
import CategorySelection from "../components/CategorySelection/CategorySelection";
import CountrySelection from "../components/CountrySelection/CountrySelection";
import ProgramSelection from "../components/ProgramSelection/ProgramSelection";
import { useCart } from "../context/CartContext";
import useLocalStorage from "../hooks/useLocalStorage";

const DonationPortal = ({ sessionId }) => {
  const [step, setStep] = useLocalStorage("donationStep", 1);
  const [selectedCategory, setSelectedCategory] = useLocalStorage("selectedCategory", "");
  const [selectedProgram, setSelectedProgram] = useLocalStorage("selectedProgram", "");
  const [selectedCountry, setSelectedCountry] = useLocalStorage("selectedCountry", "");
  const [amount, setAmount] = useLocalStorage("donationAmount", "");

  const queryClient = useQueryClient();
  const { addToCart } = useCart();
 
  const createCartMutation = useMutation({
    mutationFn: createCart,
    onSuccess: () => {
      toast.success("Cart created successfully!");
      addToCart();
      resetDonation();
      queryClient.invalidateQueries(["cart"]);
    },
    onError: (error) => toast.error(`Error creating cart: ${error.message}`),
  });

  const resetDonation = () => {
    setStep(1);
    setSelectedCategory("");
    setSelectedProgram("");
    setAmount("");
    localStorage.removeItem("donationStep");
    localStorage.removeItem("selectedCategory");
    localStorage.removeItem("selectedProgram");
    localStorage.removeItem("selectedCountry");
    localStorage.removeItem("donationAmount");
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setStep(2);
  };

  const handleProgramSelect = (program) => {
    setSelectedProgram(program);
    setStep(3);
  };

  const handleCountrySelect = async (country) => {
    setSelectedCountry(country);
    try {
      const programRate = await queryClient.fetchQuery({
        queryKey: ["programRate"],
        queryFn: () => fetchProgramRate(selectedCategory, selectedProgram, country),
      });
      if (programRate) {
        setAmount(programRate.program_rate.program_rate);
      }
      createCartMutation.mutate({
        donation_period: "one-off",
        currency: "GBP",
        currency_id: 1,
        category_id: Number(selectedCategory),
        program_id: selectedProgram,
        country_id: selectedCountry,
        quantity: 1,
        donation_amount: amount,
        donation_pound_amount: amount,
        participant_name: "",
        session_id: sessionId,
      });
    } catch (error) {
      toast.error(`Error fetching rate: ${error.message}`);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl bg-white/90 backdrop-blur-sm shadow-xl p-8">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Make a Difference</h1>
            <p className="text-gray-600">Your contribution can change lives</p>
          </header>

          {step === 1 && (
            <CategorySelection selectedCategory={selectedCategory} onSelect={handleCategorySelect} />
          )}
          {step === 2 && (
            <ProgramSelection
              category={selectedCategory}
              selectedProgram={selectedProgram}
              onSelect={handleProgramSelect}
              onBack={handleBack}
            />
          )}
          {step === 3 && (
            <CountrySelection
              category={selectedCategory}
              selectedProgram={selectedProgram}
              onSelect={handleCountrySelect}
              onBack={handleBack}
            />
          )}

        </div>
      </div>
    </div>
  );
};

export default DonationPortal;
