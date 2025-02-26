import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { ChevronLeft } from "lucide-react";
import React, { useState } from "react";
import { getCart } from "../../api/cartApi";
import { createDonation, createPaymentIntent } from "../../api/donationApi";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
// import { getCart, createPaymentIntent, createDonation } from '../../api/paymentApi';

const PaymentForm = ({
  onRequestClose,
  onPaymentSuccess,
  setCurrentStep,
  setIsSuccess,
  setIsPaymentGatewayOpen,
  isPaymentGatewayOpen,
  reference_no,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  console.log("mounted-----------");
  

  const sessionId = JSON.parse(localStorage.getItem("sessionIdData"))?.sessionId;

  // Fetch cart items (for now, cart items are not used for the dummy payment)
  const { data : cartItems=[], isLoading, isError, refetch } = useQuery({
    queryKey: ["cart", sessionId],
    queryFn: async () => (sessionId ? await getCart(sessionId) : []),
    enabled: !!sessionId,
    refetchInterval: 300000,
  });

  // Handle payment intent creation and confirmation with dummy amount and currency
  const handlePaymentIntent = useMutation({
    mutationFn: createPaymentIntent,
    onMutate: () => {
      toast.loading("Loading...");
    },
    onSuccess: () => {
      toast.dismiss();
      toast.success("good!");
      // queryClient.invalidateQueries({ queryKey: ["cart"] });
      },
    onError: (error) => {
      toast.dismiss();
    },
    onSettled: () => {
    },
  });

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (stripeError) {
      setError(stripeError.message);
      setLoading(false);
      return;
    }

    // Trigger the mutation to create and confirm payment intent
    handlePaymentIntent.mutate({amount:100,reference_no:"junvglsdktgjn"});
  };

  return (
    <>
    <div className={`h-[100vh] fixed top-0 left-0 z-50 ${isPaymentGatewayOpen ? "block" : "hidden"} w-full bg-black overflow-hidden`}>
      <div className="grid md:grid-cols-2 h-full">
        {/* Left Section */}
        <div className="h-full p-6 md:p-12 lg:p-24 flex flex-col">
          <div className="flex items-center gap-4 mb-12">
            <button className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors" onClick={() => setIsPaymentGatewayOpen(false)}>
              <ChevronLeft className="text-white" size={20} />
            </button>
            <span className="px-3 py-1 text-sm bg-orange-500 rounded-md text-white">TEST MODE</span>
          </div>
          <div className="flex-grow flex flex-col justify-center text-white">
            <div className="text-4xl md:text-4xl lg:text-6xl font-bold mb-4">
              Total Amount $10.00
            </div>
            <p className="text-gray-400">For Country: United Kingdom</p>
            <p className="text-gray-400">Items:</p>
            {cartItems.map((item) => (
              <div key={item.id}>
                <p>{item.program_name} x {item.quantity}: {item.quantity * item.donation_amount}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Section */}
        <div className="bg-white h-full overflow-y-auto">
          <div className="max-w-2xl mx-auto p-6 md:p-12 lg:p-24">
            <h1 className="text-2xl font-semibold mb-8">Pay with card</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-black focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Card information</label>
                <div className="border rounded-md p-3 focus-within:ring-2 focus-within:ring-black">
                  <CardElement options={{ style: { base: { fontSize: "16px", color: "#424770", "::placeholder": { color: "#aab7c4" }, }, invalid: { color: "#9e2146" } } }} />
                </div>
                {error && <div className="mt-2 text-red-600 text-sm">{error}</div>}
              </div>
              <button type="submit" disabled={loading || !stripe} className="w-full bg-black text-white py-4 rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                {loading ? "Processing..." : "Pay"}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-gray-500">
              <div className="flex items-center justify-center gap-2 mb-2">
                Powered by <span className="font-medium">Stripe</span>
              </div>
              <div className="flex items-center justify-center gap-4">
                <button className="hover:text-gray-700 transition-colors">Terms</button>
                <button className="hover:text-gray-700 transition-colors">Privacy</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default PaymentForm;
