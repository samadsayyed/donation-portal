import React, { createContext, useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart } from "lucide-react";

// Create the CartContext
const CartContext = createContext();

// Function to play the cart sound
const playCartSound = () => {
  const audio = new Audio("/sounds/cart-add.mp3"); // Replace with your sound file
  audio.play().catch((err) => console.error("Audio play error:", err));
};

// Cart Animation Component
const CartAnimation = () => {
  const { showAnimation, setShowAnimation } = useContext(CartContext);

  const cartVariants = {
    initial: { opacity: 0, scale: 0.5, top: "50%", left: "50%", x: "-50%", y: "-50%" },
    animate: {
      opacity: [1, 1, 1, 1, 0],
      scale: [0.5, 2, 2, 1, 0.5],
      top: ["50%", "50%", "50%", "20%", "0%"],
      left: ["50%", "50%", "50%", "70%", "100%"],
      x: ["-50%", "-50%", "-50%", "-20%", "10%"],
      y: ["-50%", "-50%", "-50%", "-50%", "-50%"],
      transition: { duration: 2, times: [0, 0.5, 0.5, 0.7, 1], ease: "easeInOut" },
    },
  };

  return (
    <AnimatePresence>
      {showAnimation && (
        <motion.div
          className="fixed z-50"
          variants={cartVariants}
          initial="initial"
          animate="animate"
          onAnimationComplete={() => setShowAnimation(false)}
        >
          <div className="bg-white rounded-full p-4 shadow-lg">
            <ShoppingCart className="text-blue-600 w-8 h-8" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Cart Provider Component
export const CartProvider = ({ children }) => {
  const [showAnimation, setShowAnimation] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Function to call when an item is added to cart
  const addToCart = () => {
    setShowAnimation(true);
    setCartCount((prev) => prev + 1);
    playCartSound();
  };

  return (
    <CartContext.Provider value={{ cartCount, addToCart, showAnimation, setShowAnimation }}>
      {children}
      <CartAnimation /> {/* Animation is always present but only triggers when needed */}
    </CartContext.Provider>
  );
};

// Hook to use cart anywhere
export const useCart = () => useContext(CartContext);
