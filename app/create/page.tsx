"use client";

import { motion } from "framer-motion";
import MemeForm from "../components/MemeForm";

export default function CreateMeme() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-4 py-8"
      >
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text">
          Create Your Meme
        </h1>
        <p className="text-gray-300 mb-8">
          Upload your meme, add a caption, and include hashtags to make it discoverable.
          Connect your wallet to submit your creation to the Umi network.
        </p>
        <MemeForm />
      </motion.div>
    </div>
  );
} 