import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="min-h-[80vh] bg-white flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                {/* 404 Text with Animation */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-4"
                >
                    <h1 className="text-7xl font-bold text-primary">404</h1>
                </motion.div>

                {/* Error Message */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mb-4"
                >
                    <h2 className="text-xl font-semibold text-gray-800">Page Not Found</h2>
                    <p className="text-gray-600 text-sm">
                        The page you're looking for doesn't exist.
                    </p>
                </motion.div>

                {/* Animated Illustration */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                        delay: 0.3
                    }}
                    className="mb-4"
                >
                    <svg
                        className="w-32 h-32 mx-auto text-primary"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                    >
                        <motion.path
                            d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5, delay: 0.4 }}
                        />
                    </svg>
                </motion.div>

                {/* Home Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <Link
                        to="/"
                        className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primaryHover transition-colors text-sm"
                    >
                        <Home className="w-4 h-4 mr-1" />
                        Back to Home
                    </Link>
                </motion.div>

                {/* Background Decoration */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    {[...Array(10)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-primary opacity-10 rounded-full"
                            initial={{
                                x: Math.random() * window.innerWidth,
                                y: Math.random() * window.innerHeight,
                                scale: 0
                            }}
                            animate={{
                                scale: [0, 1, 0],
                                opacity: [0, 0.5, 0]
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: i * 0.1
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NotFound; 