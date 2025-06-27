"use client";

import { motion } from "framer-motion";

export default function Profile() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-4 py-16"
      >
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text">
          Your Profile
        </h1>
        <p className="text-gray-300">Coming soon - View your memes, stakes, and earnings!</p>
      </motion.div>
    </div>
  );
} 