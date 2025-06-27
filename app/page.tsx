"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";

interface MemeCard {
  id: number;
  title: string;
  image: string;
  stakes: number;
  creator: string;
  endTime: string;
}

const demoMemes: MemeCard[] = [
  {
    id: 1,
    title: "When Bitcoin Hits ATH 🚀",
    image: "/next.svg",
    stakes: 2.5,
    creator: "cryptolord",
    endTime: "2h 30m",
  },
  {
    id: 2,
    title: "Ethereum Merge Drama 😅",
    image: "/vercel.svg",
    stakes: 1.8,
    creator: "memequeen",
    endTime: "4h 15m",
  },
  {
    id: 3,
    title: "DOGE to the Moon 🌙",
    image: "/next.svg",
    stakes: 3.2,
    creator: "dogefather",
    endTime: "1h 45m",
  },
];

export default function Home() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const handleConnectWallet = () => {
    setIsWalletConnected(true);
    // Add wallet connection logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white pt-20">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-4 py-16"
      >
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.h1
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text"
          >
            Meme. Stake. Moon. 🚀
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4 mb-8 text-xl text-gray-300"
          >
            <p className="font-medium">
              Turn your crypto jokes into digital gold! Create memes, stake tokens, and ride the wave to the moon.
            </p>
            <p className="text-purple-400 font-bold">
              Because who said DeFi can't be funny? 😎
            </p>
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleConnectWallet}
            className={`
              px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-shadow duration-300
              ${isWalletConnected
                ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              }
            `}
          >
            {isWalletConnected ? "Create Your First Meme →" : "Connect Wallet"}
          </motion.button>
        </div>

        {/* Trending Memes Section */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">🔥 Trending Memes</h2>
            <p className="text-gray-400">Vote on the hottest crypto memes and earn rewards</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {demoMemes.map((meme, index) => (
              <motion.div
                key={meme.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-gray-800/30 rounded-xl overflow-hidden backdrop-blur-sm border border-gray-700/50"
              >
                <div className="relative h-64">
                  <Image
                    src={meme.image}
                    alt={meme.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{meme.title}</h3>
                  <div className="flex justify-between items-center text-sm text-gray-400">
                    <span>by @{meme.creator}</span>
                    <span>{meme.stakes} ETH staked</span>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-red-400">Ends in {meme.endTime}</span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-full text-sm font-bold transition-colors duration-200"
                    >
                      Stake Now
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* How It Works Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-3xl p-12 mb-16"
        >
          <h2 className="text-3xl font-bold mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-bold">Create</h3>
              <p className="text-gray-300">Design and upload your crypto-themed memes</p>
            </div>
            <div className="space-y-4">
              <div className="text-4xl mb-4">💎</div>
              <h3 className="text-xl font-bold">Stake</h3>
              <p className="text-gray-300">Back your favorite memes with crypto</p>
            </div>
            <div className="space-y-4">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-bold">Earn</h3>
              <p className="text-gray-300">Win rewards when your memes or stakes succeed</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
