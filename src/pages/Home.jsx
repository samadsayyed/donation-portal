import { useMutation } from "@tanstack/react-query";
import React, { useEffect } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import { createCart } from "../api/cartApi";
import AmountSelection from "../components/DonationComponents/AmountSelection/AmountSelection";
import CategorySelection from "../components/DonationComponents/CategorySelection/CategorySelection";
import CountrySelection from "../components/DonationComponents/CountrySelection/CountrySelection";
import ProgramSelection from "../components/DonationComponents/ProgramSelection/ProgramSelection";
import { useCart } from "../context/CartContext";
import useLocalStorage from "../hooks/useLocalStorage";

const DonationPortal = ({ sessionId,setIsCartOpen,setRender,render }) => {
  const [step, setStep] = useLocalStorage("donationStep", 1);
  const [selectedCategory, setSelectedCategory] = useLocalStorage("selectedCategory","");
  const [selectedProgram, setSelectedProgram] = useLocalStorage("selectedProgram","");
  const [selectedCountry, setSelectedCountry] = useLocalStorage("selectedCountry","");
  const [amount, setAmount] = useLocalStorage("donationAmount", "");
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();

  const createCartMutation = useMutation({
    mutationFn: createCart,
    onMutate: () => {
      toast.loading("Creating cart...");
    },
    onSuccess: () => {
      toast.dismiss();
      toast.success("Cart created successfully!");
      addToCart();
      resetDonation();
      setRender(p=>!p);
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
  
    if (!country) country = "19"; // Set country to 19 if not defined
  
    if (category) setSelectedCategory(category);
    if (program) setSelectedProgram(program);
    if (country) setSelectedCountry(country);
    if (amount) setAmount(amount);
  
    // If all parameters exist, skip to the amount selection step
    if (category && program && type === "one-off") {
      setStep(4);
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
    localStorage.removeItem("selectedCategory");
    localStorage.removeItem("selectedProgram");
    localStorage.removeItem("selectedCountry");
    localStorage.removeItem("donationAmount");
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setStep(2);
  };

  const handleCountrySelect = async (country) => {
    setSelectedCountry(country);
    setStep(4);
  };

  const handleAmountSelect = async (amount) => {
    try {
      const payload = {
        donation_period: selectedCategory == 1 ? "one-off" : selectedCategory == 10 ? "monthly" : "",
        currency: "GBP",
        currency_id: 1,
        category_id: Number(selectedCategory),
        program_id: selectedProgram,
        country_id: selectedCountry || 19,
        quantity: 1,
        donation_amount: amount,
        donation_pound_amount: amount,
        participant_name: "",
        session_id: sessionId,
      };

      createCartMutation.mutate(payload);

    } catch (error) {
      toast.error(`Error fetching rate: ${error.message}`);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };



  

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 ">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl bg-white/90 backdrop-blur-sm shadow-xl p-8">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Make a Difference
            </h1>
            <p className="text-gray-600">Your contribution can change lives</p>
          </header>

          {step === 1 && (
            <CategorySelection
              selectedCategory={selectedCategory}
              onSelect={handleCategorySelect}
            />
          )}
          {step === 2 && (
            <ProgramSelection
              category={selectedCategory}
              program={selectedProgram}
              onBack={handleBack}
              setStep={setStep}
              setSelectedProgram={setSelectedProgram}
            />
          )}
          {step === 3 && (
            <CountrySelection
              category={selectedCategory}
              program={selectedProgram}
              onSelect={handleCountrySelect}
              onBack={handleBack}
              setStep={setStep}
            />
          )}

          {step === 4 && (
            <AmountSelection
              prevData={{ selectedCategory, selectedCountry, selectedProgram }}
              selectedProgram={selectedProgram}
              onSelect={handleCountrySelect}
              setStep={setStep}
              onBack={handleBack}
              handleAmountSelect={handleAmountSelect}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DonationPortal;
