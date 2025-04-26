import React, { useEffect, useState, useCallback } from "react";
import ItemCard from "./ItemCard";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteFromCart, getCart, updateCart } from "../../api/cartApi";
import useSessionId from "../../hooks/useSessionId";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { ShoppingCart, AlertCircle, Loader2, ChevronRight, Info } from "lucide-react";
import { motion } from "framer-motion";

const DonationCart = ({ setCart, participantNames, setParticipantNames, onNext }) => {
  const sessionId = useSessionId();
  const { user, isAuthenticated } = useAuth();
  const [selfDonateItems, setSelfDonateItems] = useState({});

  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["cart", isAuthenticated ? user?.user_id : sessionId],
    queryFn: async () => {
      if (isAuthenticated && user?.user_id) {
        return await getCart({ donor_id: user.user_id, session_id: '' });
      }
      return sessionId ? await getCart({ session_id: sessionId, donor_id: '' }) : [];
    },
    enabled: isAuthenticated ? !!user?.user_id : !!sessionId,
    refetchInterval: 300000,
  });

  // Update cart in localStorage and parent component
  useEffect(() => {
    if (data.length > 0) {
      localStorage.setItem("cart", JSON.stringify(data));
      setCart(data);
    }
  }, [data, setCart]);

  // Initialize participant names when cart changes
  useEffect(() => {
    if (data.length > 0) {
      const initialNames = {};
      const initialSelfDonate = {};
      data.forEach((item) => {
        if (!initialNames[item.cart_id]) {
          const totalParticipants = item.quantity * (item.animal_share || 1);
          initialSelfDonate[item.cart_id] = isAuthenticated && user?.first_name ? true : false;
          if (initialSelfDonate[item.cart_id]) {
            initialNames[item.cart_id] = Array(totalParticipants).fill(user.first_name);
          } else {
            initialNames[item.cart_id] = Array(totalParticipants).fill("");
          }
        }
      });
      setParticipantNames(initialNames);
      setSelfDonateItems(initialSelfDonate);
    }
  }, [data, isAuthenticated, user?.first_name]);

  const handleParticipantNameChange = useCallback((itemId, index, value) => {
    setParticipantNames((prev) => {
      const updated = { ...prev };
      if (!updated[itemId]) {
        updated[itemId] = Array(1).fill("");
      }
      updated[itemId][index] = value;
      return updated;
    });
  }, []);

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

  const updateQuantity = useCallback((id, newQuantity) => {
    if (newQuantity < 1) return;
    quantityMutation.mutate({ id, newQuantity });

    const item = data.find(item => item.cart_id === id);
    const totalParticipants = newQuantity * (item?.animal_share || 1);

    setParticipantNames((prev) => {
      const updated = { ...prev };
      updated[id] = Array(totalParticipants).fill("");
      return updated;
    });
  }, [quantityMutation, data]);

  const removeItem = useCallback((cartId) => {
    deleteMutation.mutate(cartId);
    setParticipantNames((prev) => {
      const updated = { ...prev };
      delete updated[cartId];
      return updated;
    });
  }, [deleteMutation]);

  const getTotalAmount = useCallback(() => {
    return data.reduce((sum, item) => sum + item.donation_amount * item.quantity, 0);
  }, [data]);


  // Check if all required participant names are filled
  const areAllParticipantNamesFilled = useCallback(() => {
    for (const item of data) {
      if (item.participant_required === "Y") {
        const names = participantNames[item.cart_id] || [];
        if (names.some(name => !name.trim())) {
          return false;
        }
      }
    }
    return true;
  }, [data, participantNames]);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-black flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            Your Donation Cart
          </h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((index) => (
            <div key={`skeleton-${index}`} className="animate-pulse space-y-2 p-4 border border-gray-100 rounded-lg">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-100 rounded w-1/2"></div>
              <div className="h-8 bg-gray-100 rounded w-1/4 mt-4"></div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-black flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            Your Donation Cart
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-red-500">
          <AlertCircle className="w-12 h-12 mb-4" />
          <p className="text-lg font-medium">Error loading the cart</p>
          <p className="text-sm text-gray-500 mt-2">Please try again later</p>
        </div>
      </motion.div>
    );
  }

  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-black flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            Your Donation Cart
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <ShoppingCart className="w-12 h-12 mb-4" />
          <p className="text-lg font-medium">Your cart is empty</p>
          <p className="text-sm mt-2">Add some items to your cart to continue</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-black flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-primary" />
          Your Donation Cart
        </h2>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {data.length} {data.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="space-y-6">
        {data.map((item, index) => (
          <motion.div
            key={item.cart_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="border border-gray-100 rounded-lg p-4 hover:border-gray-200 transition-colors hover:shadow-sm"
          >
            <ItemCard
              item={item}
              updateQuantity={updateQuantity}
              removeItem={removeItem}
              showParticipantInput={true}
            />

            {/* Self Donate Option */}
            {isAuthenticated && item.participant_required === "Y" && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selfDonateItems[item.cart_id] || false}
                    onChange={(e) => {
                      setSelfDonateItems(prev => ({
                        ...prev,
                        [item.cart_id]: e.target.checked
                      }));
                      if (e.target.checked && user?.first_name) {
                        setParticipantNames(prev => ({
                          ...prev,
                          [item.cart_id]: Array(item.quantity).fill(user.first_name)
                        }));
                      } else {
                        setParticipantNames(prev => ({
                          ...prev,
                          [item.cart_id]: Array(item.quantity).fill("")
                        }));
                      }
                    }}
                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                  />
                  <span className="text-sm text-gray-700">Donate on behalf of myself</span>
                </label>
              </div>
            )}

            {/* Participant Name Inputs */}
            {item.participant_required === "Y" && !selfDonateItems[item.cart_id] && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <label className="block font-medium text-gray-700">
                    Participant Names <span className="text-red-500">*</span>
                  </label>
                  <div className="group relative">
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                      Please enter the names of all participants for this donation.
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Array.from({ length: item.quantity * (item.animal_share || 1) }).map((_, index) => (
                    <div key={`${item.cart_id}-participant-${index}`} className="relative">
                      <input
                        type="text"
                        value={participantNames[item.cart_id]?.[index] || ""}
                        onChange={(e) =>
                          handleParticipantNameChange(item.cart_id, index, e.target.value)
                        }
                        placeholder={`Participant ${index + 1}`}
                        className={`w-full px-4 py-2 border ${participantNames[item.cart_id]?.[index]
                          ? 'border-green-300 focus:ring-green-200'
                          : 'border-gray-300 focus:ring-primary/20'
                          } rounded-lg focus:ring-2 focus:border-primary outline-none transition-colors`}
                      />
                      {participantNames[item.cart_id]?.[index] && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                          ✓
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <p className="text-sm text-gray-500">Total Items: {data.length}</p>
            <p className="text-sm text-gray-500 mt-1">Total Amount:</p>
          </div>
          <p className="text-2xl font-bold text-primary">
            £{getTotalAmount().toFixed(2)}
          </p>
        </div>
      </div>

      {!areAllParticipantNamesFilled() && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
          <p className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Please fill in all participant names before proceeding.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default DonationCart;
