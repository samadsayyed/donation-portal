import React, { useEffect, useState } from "react";
import ItemCard from "./ItemCard";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteFromCart, getCart, updateCart } from "../../api/cartApi";
import useSessionId from "../../hooks/useSessionId";
import toast from "react-hot-toast";

const DonationCart = ({ setCart }) => {
  const sessionId = useSessionId();
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["cart", sessionId],
    queryFn: async () => (sessionId ? await getCart(sessionId) : []),
    enabled: !!sessionId,
    refetchInterval: 300000,
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(data));
    setCart(data)
  }, [data]);

  const [participantNames, setParticipantNames] = useState({});

  useEffect(() => {
    // Initialize participant names when cart changes
    const initialNames = {};
    data.forEach((item) => {
      if (!initialNames[item.id]) {
        initialNames[item.id] = Array(item.quantity).fill("");
      }
    });
    setParticipantNames(initialNames);
  }, [data]);

  const handleParticipantNameChange = (itemId, index, value) => {
    setParticipantNames((prev) => {
      const updated = { ...prev };
      updated[itemId][index] = value;
      return updated;
    });
  };

  const quantityMutation = useMutation({
    mutationFn: updateCart,
    onMutate: () => {
      toast.loading("Updating cart...");
    },
    onSuccess: () => {
      toast.dismiss();
      toast.success("Cart updated successfully!");
      refetch();
    },
    onError: (error) => {
      toast.dismiss();
      toast.error(`Error updating cart: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFromCart,
    onMutate: () => {
      toast.loading("Removing item...");
    },
    onSuccess: () => {
      toast.dismiss();
      toast.success("Item removed from cart");
      refetch();
    },
    onError: (error) => {
      toast.dismiss();
      toast.error(`Error removing item: ${error.message}`);
    },
  });

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    quantityMutation.mutate({ id, newQuantity });

    setParticipantNames((prev) => {
      const updated = { ...prev };
      updated[id] = Array(newQuantity).fill("");
      return updated;
    });
  };

  const removeItem = (cartId) => {
    deleteMutation.mutate(cartId);
    setParticipantNames((prev) => {
      const updated = { ...prev };
      delete updated[cartId];
      return updated;
    });
  };

  const getTotalAmount = () =>data.reduce((sum, item) => sum + item.donation_amount * item.quantity, 0);


  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-6 text-black">Your Donation Cart</h2>
        {/* Loading Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((_, index) => (
            <div key={index} className="animate-pulse space-y-2">
              <div className="h-6 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200 text-red-500">
        <h2 className="text-xl font-semibold mb-6 text-black">Your Donation Cart</h2>
        <p>Error loading the cart. Please try again later.</p>
      </div>
    );
  }


  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h2 className="text-xl font-semibold mb-6 text-black">Your Donation Cart</h2>
      {data.map((item) => (
        <div key={item.id}>
          <ItemCard
            item={item}
            updateQuantity={updateQuantity}
            removeItem={removeItem}
            showParticipantInput={true}
          />

          {/* Participant Name Inputs */}
          {item.participant_required == "Y" && (
            <div className="mt-4">
              <label className="block font-medium text-black mb-2">
                Participant Names (Required):
              </label>
              {Array.from({ length: item.quantity }).map((_, index) => (
                <input
                  key={index}
                  type="text"
                  value={participantNames[item.id]?.[index] || ""}
                  onChange={(e) =>
                    handleParticipantNameChange(item.id, index, e.target.value)
                  }
                  placeholder={`Participant ${index + 1}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
                />
              ))}
            </div>
          )}
        </div>
      ))}
      <div className="mt-6 flex flex-col sm:flex-row sm:justify-between sm:items-center border-t pt-4">
        <p className="font-medium text-black text-center sm:text-left">
          Total Amount:
        </p>
        <p className="text-xl font-semibold text-black text-center sm:text-right">
          £{getTotalAmount().toFixed(2)}
        </p>
      </div>
    </div>
  );
};

export default DonationCart;
