"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { HomeIcon } from "@heroicons/react/24/solid";
import ConnectButton from "./ConnectButton";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

const NavLink = ({ href, children }: NavLinkProps) => (
  <Link href={href} className="relative group">
    <motion.span
      className="text-gray-300 hover:text-white transition-colors duration-200"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.span>
    <motion.span
      className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-300"
      whileHover={{ width: "100%" }}
    />
  </Link>
);

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="fixed w-full top-0 z-50 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center"
          >
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text">
              🌟 Starfish
            </Link>
          </motion.div>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8 items-center">
            <NavLink href="/">
              <HomeIcon className="w-5 h-5 text-gray-300 group-hover:text-white" />
            </NavLink>
            <NavLink href="/create">Create Meme</NavLink>
            <NavLink href="/memepool">Meme Pool</NavLink>
            <NavLink href="/profile">Profile</NavLink>
          </div>

          {/* Connect Wallet Button */}
          <div className="flex items-center">
            <ConnectButton />
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="md:hidden text-white"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
} 