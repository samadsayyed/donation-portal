import { useMutation, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronRight, Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { deleteFromCart, getCart, updateCart } from '../api/cartApi';
import useSessionId from '../hooks/useSessionId';
import { useAuth } from '../context/AuthContext';

// Cart Component
const Cart = ({ isOpen, setIsOpen, render, setRender }) => {
  const sessionId = useSessionId();
  const { user, isAuthenticated } = useAuth();

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

  useEffect(() => {
    refetch()
  }, [isOpen])

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
  };

  const handleDelete = (cartId) => {
    deleteMutation.mutate(cartId);
  };

  return (
    <CartSidebar
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      cartItems={data}
      isLoading={isLoading}
      updateQuantity={updateQuantity}
      onDelete={handleDelete}
    />
  );
};

// Sidebar Component
const CartSidebar = ({ isOpen, onClose, cartItems, updateQuantity, onDelete, isLoading }) => {
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const calculateTotal = () =>
    cartItems.reduce((total, item) => total + item.donation_amount * item.quantity, 0);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/25 backdrop-blur-sm z-40 pb-28 samad">
          <motion.div
            ref={sidebarRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-96 max-w-full md:w-96 bg-gray-50/95 backdrop-blur-xl shadow-2xl z-50 "
          >
            <div className="flex flex-col h-[calc(100vh-5rem)] md:h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-grey">Your Cart</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto py-4">
                {isLoading ? (
                  <>
                    <SkeletonLoader />
                    <SkeletonLoader />
                    <SkeletonLoader />
                  </>
                ) : cartItems.length > 0 ? (
                  cartItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-4 p-4 hover:bg-gray-100/50 transition-colors group"
                    >
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
                        <img
                          src={item.program_image || "/no-image.jpg"}
                          alt={item.program_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-grey">{item.program_name}</h3>
                        </div>
                        <p className="text-sm text-gray-500">£{item.donation_amount}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            onClick={() => updateQuantity(item.cart_id, item.quantity - 1)}
                            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4 text-gray-600" />
                          </button>

                          <span className="text-sm font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.cart_id, item.quantity + 1)}
                            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                          >
                            <Plus className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => onDelete(item.cart_id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <ShoppingCart className="w-12 h-12 mb-2" />
                    <p>Your cart is empty.</p>
                  </div>
                )}
              </div>

              {/* Add More Programs Button */}
              <div className="border-gray-200 p-6 space-y-4">
                <button
                  onClick={() => {
                    window.location.href = "https://zobiatrust.org/all-appeals/";
                    onClose();
                  }}
                  className="w-full bg-primary text-white py-4 px-6 rounded-2xl font-medium hover:bg-primaryHover transition-colors flex items-center justify-center gap-2"
                >
                  Add More Programs <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Footer - Show Checkout Only If Cart Has Items */}
              {cartItems.length > 0 && (
                <div className="border-t border-gray-200 p-6 space-y-4">
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>£{calculateTotal().toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      navigate("/checkout");
                    }}
                    className="w-full bg-primary text-white py-4 px-6 rounded-2xl font-medium hover:bg-primaryHover transition-colors flex items-center justify-center gap-2"
                  >
                    Checkout <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

// Skeleton Loader Component
const SkeletonLoader = () => (
  <div className="animate-pulse flex items-center gap-4 p-4">
    <div className="w-20 h-20 bg-gray-200 rounded-xl"></div>
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
);

export default Cart;