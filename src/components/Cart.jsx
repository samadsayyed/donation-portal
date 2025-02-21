import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Minus, ChevronRight,ShoppingCart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import useSessionId from '../hooks/useSessionId';
import { getCart } from '../api/cartApi';

// Cart Component
const Cart = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [items, setItems] = React.useState([
    {
      id: 1,
      title: "Professional Suite",
      price: 199.99,
      quantity: 1,
      image: "/api/placeholder/80/80"
    },
    {
      id: 2,
      title: "Creative Studio Pro",
      price: 299.99,
      quantity: 1,
      image: "/api/placeholder/80/80"
    }
  ]);

  const sessionId = useSessionId() 

  console.log(sessionId,"saess");
  

  const {data,isLoading,isError} = useQuery({
    queryKey: ['cart'],
    queryFn: ()=>getCart(sessionId),
    staleTime: 50 * 60 * 1000, // Consider data fresh for 50 minutes
    refetchInterval: 50 * 60 * 1000, // Auto-refetch every 50 minutes
  });


  console.log(data,"data");
  
  

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setItems(items.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  return (
    <div className=" absolute top-3 right-3 z-10">
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-4 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors"
      >
        <ShoppingCart/>
      </button>

      <CartSidebar
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        cartItems={data}
        updateQuantity={updateQuantity}
      />
    </div>
  );
};

const CartSidebar = ({ isOpen, onClose, cartItems, updateQuantity }) => {
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/25 backdrop-blur-sm z-40">
          <motion.div
            ref={sidebarRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-96 bg-gray-50/95 backdrop-blur-xl shadow-2xl z-50"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Your Cart</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto py-4">
                {cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 p-4 hover:bg-gray-100/50 transition-colors"
                  >
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
                      <img
                        src={item.program_image || "/api/placeholder/80/80"}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.program_name}</h3>
                      <p className="text-sm text-gray-500">${item.donation_amount}</p>
                      
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                        >
                          <Plus className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-6 space-y-4">
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
                <button className="w-full bg-gray-900 text-white py-4 px-6 rounded-2xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                  Checkout
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};



export default Cart;