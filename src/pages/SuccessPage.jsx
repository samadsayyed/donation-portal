import { AnimatePresence, motion } from 'framer-motion';
import { Gift, Home } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { clearLocalStorageAfterDelay, decryptData } from '../utils/functions';

const PaymentSuccessPage = () => {
  const [showConfetti, setShowConfetti] = useState(true);
  const { data } = useParams();

  console.log(data, "============================");

  const [parsedData, setParsedData] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    try {
      const decryptedData = JSON.parse(decryptData(data));
      setParsedData(decryptedData);
    } catch (error) {
      console.error("Error parsing data:", error);
    }

    clearLocalStorageAfterDelay(1);
  }, [data]);

  if (!parsedData) {
    return <div>Loading...</div>; // Handle case where data is still being set
  }

  const userCart = parsedData.cart || [];

  const userData = {
    name: `${parsedData.personalInfo.firstName} ${parsedData.personalInfo.lastName}`,
    email: parsedData.personalInfo.email,
    phone: parsedData.personalInfo.phone,
    address: `${parsedData.personalInfo.address1}, ${parsedData.personalInfo.address2}, ${parsedData.personalInfo.city}, ${parsedData.personalInfo.postcode}, ${parsedData.personalInfo.country}`,
    program: "Premium Membership",
    amount: "$99.99",
  };

  // Motion variants for animations
  const pageTransition = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.8 },
    },
  };


  return (
    <motion.div
      className="min-h-screen bg-white flex items-center justify-center p-4 overflow-hidden relative"
      initial="hidden"
      animate="visible"
      variants={pageTransition}
    >
      {/* Background animated elements */}
      <BackgroundAnimation />

      {/* Confetti explosion */}
      <AnimatePresence>
        {showConfetti && <ConfettiExplosion />}
      </AnimatePresence>

      {/* Main success card */}
      <motion.div
        className="max-w-md w-full bg-white shadow-2xl rounded-lg overflow-hidden border border-secondaryDark relative z-10"
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0
        }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 15,
          delay: 0.2
        }}
      >
        <div className="p-8">
          {/* Success icon with ripple effect */}
          <SuccessIcon />

          {/* Transaction details */}
          <TransactionDetails userData={userData} userCart={userCart} />

          {/* Action buttons */}
          <ActionButtons />

          {/* Countdown timer */}
          {/* <CountdownTimer countdown={countdown} /> */}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Dramatic success icon with animated ripple effect
const SuccessIcon = () => {
  return (
    <div className="flex flex-col items-center justify-center mb-6">
      <div className="relative mb-6">
        {/* Multiple ripples */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2 rounded-full bg-primary opacity-30"
            initial={{ width: 0, height: 0, x: 0, y: 0 }}
            animate={{
              width: `${150 + i * 30}px`,
              height: `${150 + i * 30}px`,
              x: `-${75 + i * 15}px`,
              y: `-${75 + i * 15}px`,
              opacity: 0
            }}
            transition={{
              width: { duration: 2, repeat: Infinity, repeatDelay: 1.5, delay: i * 0.4 },
              height: { duration: 2, repeat: Infinity, repeatDelay: 1.5, delay: i * 0.4 },
              x: { duration: 2, repeat: Infinity, repeatDelay: 1.5, delay: i * 0.4 },
              y: { duration: 2, repeat: Infinity, repeatDelay: 1.5, delay: i * 0.4 },
              opacity: {
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1.5,
                delay: i * 0.4,
                from: 0.6,
                to: 0
              }
            }}
          />
        ))}

        {/* Check circle */}
        <motion.div
          className="w-24 h-24 rounded-full bg-primary flex items-center justify-center relative z-10"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
            delay: 0.5
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <motion.path
                d="M20 6L9 17L4 12"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: 0.8,
                  delay: 1.2,
                  ease: "easeInOut"
                }}
              />
            </svg>
          </motion.div>
        </motion.div>
      </div>

      {/* Success text with character animation */}
      <motion.div className="overflow-hidden mb-2">
        <motion.h1
          className="text-xl font-bold text-primary text-center"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 15,
            delay: 1
          }}
        >
          <AnimatedText text="Payment Successful!" />
        </motion.h1>
      </motion.div>

      {/* Animated line */}
      <motion.div className="w-full flex justify-center mb-4">
        <svg width="200" height="10" viewBox="0 0 200 10">
          <motion.path
            d="M 0,5 L 200,5"
            stroke="primary"
            strokeWidth="2"
            strokeLinecap="round"
            fill="transparent"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 1.5,
              delay: 2,
              ease: "easeInOut"
            }}
          />
        </svg>
      </motion.div>

      <motion.p
        className="text-secondaryDark text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.2 }}
      >
        Thank you for your donation. Your transaction has been completed.
      </motion.p>
    </div>
  );
};

// Helper component for character-by-character text animation
const AnimatedText = ({ text }) => {
  return (
    <span className="inline-block">
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 + index * 0.05 }}
          className="inline-block"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
};

// Transaction details with staggered appearance
const TransactionDetails = ({ userData, userCart }) => {

  console.log(userCart);
  

  return (
    <motion.div
      className="border-t border-b border-secondaryDark py-6 mb-6"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      transition={{ duration: 0.6, delay: 2.5 }}
    >
      <motion.h2
        className="text-xl font-semibold text-primary mb-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2.7 }}
      >
        Transaction Details
      </motion.h2>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Name", value: userData.name },
          { label: "Email", value: userData.email },
          { label: "Phone", value: userData.phone },
          { label: "Address", value: userData.address },
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2.8 + index * 0.1 }}
          >
            <p className="text-secondaryDark text-sm">{item.label}</p>
            <p className="font-medium text-primary truncate" title={item.value}>
              {item.value}
            </p>
          </motion.div>
        ))}

        {
          userCart.map((item, index) => {
            console.log(item);

            return (
             <>
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2.8 + index * 0.1 }}
              >
                {index == 0 && <p className="text-secondaryDark text-sm">Program</p>}
                <p className="font-medium text-primary truncate" title={"item.value"}>
                  {item.program_name}
                </p>
              </motion.div>
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2.8 + index * 0.1 }}
              >
                {index == 0 && <p className="text-secondaryDark text-sm">Amount</p>}
                <p className="font-medium text-primary truncate" title={"item.value"}>
                £ {item.donation_amount * item.quantity}
                </p>
              </motion.div>
              </>
            )
          })
        }
      </div>
      

    </motion.div>
  );
};

// Action buttons with hover effects
const ActionButtons = () => {
  return (
    <motion.div
      className="flex flex-col sm:flex-row gap-4"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 3.4 }}
    >
      <motion.button
        className="flex-1 bg-primary text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-secondaryDark transition-colors relative overflow-hidden"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => {
          window.location.href = "https://zobiatrust.org/";
        }}
      >
        <motion.span
          className="absolute inset-0 bg-white opacity-20"
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.6 }}
        />
        <Gift size={18} />
        Donate More
      </motion.button>

      <motion.button
        className="flex-1 border border-primary text-primary py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-secondaryDark transition-colors relative overflow-hidden"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => window.location.href = "/"}
      >
        <motion.span
          className="absolute inset-0 bg-primary opacity-5"
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.6 }}
        />
        <Home size={18} />
        Home
      </motion.button>
    </motion.div>
  );
};



// Background subtle animations
const BackgroundAnimation = () => {
  return (
    <div className="fixed inset-0 z-0">
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 opacity-5"
        animate={{
          background: [
            "radial-gradient(circle at 0% 0%, #000 0%, transparent 50%)",
            "radial-gradient(circle at 100% 0%, #000 0%, transparent 50%)",
            "radial-gradient(circle at 100% 100%, #000 0%, transparent 50%)",
            "radial-gradient(circle at 0% 100%, #000 0%, transparent 50%)",
            "radial-gradient(circle at 0% 0%, #000 0%, transparent 50%)"
          ]
        }}
        transition={{
          duration: 15,
          ease: "linear",
          repeat: Infinity,
          times: [0, 0.25, 0.5, 0.75, 1]
        }}
      />

      {/* Floating elements */}
      {[...Array(15)].map((_, i) => {
        const randomX1 = Math.random() * 100;
        const randomX2 = Math.random() * 100;
        const randomX3 = Math.random() * 100;
        const randomY1 = Math.random() * 100;
        const randomY2 = Math.random() * 100;
        const randomY3 = Math.random() * 100;
        const randomScale1 = Math.random() * 0.5 + 0.5;
        const randomScale2 = Math.random() * 1 + 1;
        const randomScale3 = Math.random() * 0.5 + 0.5;

        return (
          <motion.div
            key={i}
            className="absolute w-12 h-12 rounded-full bg-primary opacity-5"
            initial={{
              left: `${randomX1}%`,
              top: `${randomY1}%`,
              scale: randomScale1
            }}
            animate={{
              left: [`${randomX1}%`, `${randomX2}%`, `${randomX3}%`],
              top: [`${randomY1}%`, `${randomY2}%`, `${randomY3}%`],
              scale: [randomScale1, randomScale2, randomScale3]
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse",
              times: [0, 0.5, 1]
            }}
          />
        );
      })}
    </div>
  );
};

// Exploding confetti effect
const ConfettiExplosion = () => {
  const colors = ["#000000", "#333333", "#666666", "#999999"];

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-20"
      exit={{ opacity: 0 }}
    >
      {[...Array(100)].map((_, i) => {
        const size = Math.random() * 12 + 4;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const angle = Math.random() * Math.PI * 2; // In radians for calculation
        const distance = 100 + Math.random() * 400;
        const xDistance = Math.cos(angle) * distance;
        const yDistance = Math.sin(angle) * distance;

        return (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2 rounded-md origin-center z-50"
            style={{
              width: size,
              height: size * (0.5 + Math.random()),
              backgroundColor: color,
              rotate: `${Math.random() * 360}deg`
            }}
            initial={{
              x: 0,
              y: 0,
              scale: 0,
              opacity: 1
            }}
            animate={{
              x: xDistance,
              y: yDistance,
              scale: 1,
              opacity: [1, 1, 0],
              rotate: `${Math.random() * 720 + 1080}deg`
            }}
            transition={{
              duration: 2.5,
              ease: "easeOut",
              opacity: {
                duration: 2.5,
                times: [0, 0.7, 1]
              }
            }}
          />
        );
      })}
    </motion.div>
  );
};

export default PaymentSuccessPage;